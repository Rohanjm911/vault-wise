import io
import csv
import os
from datetime import date
from typing import List, Optional, Tuple
from collections import defaultdict
from pathlib import Path

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.legends import Legend
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from app.models.transaction import Transaction
from app.models.category import Category


def _register_report_fonts() -> Tuple[str, str]:
    """Register unicode-capable TrueType fonts (e.g. Segoe UI or Arial) so currency symbols like ₹, €, £ render natively.
    
    Returns (regular_font_name, bold_font_name).
    """
    try:
        registered = pdfmetrics.getRegisteredFontNames()
        if "VaultFont" in registered and "VaultFont-Bold" in registered:
            return "VaultFont", "VaultFont-Bold"

        candidates = [
            # Windows system fonts
            (r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\segoeuib.ttf"),
            (r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\arialbd.ttf"),
            (r"C:\Windows\Fonts\calibri.ttf", r"C:\Windows\Fonts\calibrib.ttf"),
            (r"C:\Windows\Fonts\Nirmala.ttf", r"C:\Windows\Fonts\NirmalaB.ttf"),
            # Linux system fonts
            ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
            ("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"),
            ("/usr/share/fonts/truetype/freefont/FreeSans.ttf", "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"),
        ]
        for reg, bld in candidates:
            if os.path.isfile(reg) and os.path.isfile(bld):
                pdfmetrics.registerFont(TTFont("VaultFont", reg))
                pdfmetrics.registerFont(TTFont("VaultFont-Bold", bld))
                return "VaultFont", "VaultFont-Bold"
    except Exception:
        pass

    return "Helvetica", "Helvetica-Bold"


def generate_csv_export(
    transactions: List[Transaction],
    currency_code: str = "USD",
    currency_symbol: str = "$",
) -> io.StringIO:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Date", "Type", "Category", f"Amount ({currency_symbol})", "Description", "Notes", "Currency"])

    for tx in transactions:
        cat_name = tx.category.name if tx.category else "Uncategorized"
        amt = f"{tx.amount_cents / 100:.2f}"
        # Prepend quote if cell starts with formula trigger characters to prevent CSV injection
        desc = tx.description
        if desc and desc[0] in ("=", "+", "-", "@"):
            desc = "'" + desc

        writer.writerow([
            tx.id,
            tx.date.isoformat(),
            tx.type,
            cat_name,
            amt,
            desc,
            tx.notes or "",
            currency_code,
        ])

    output.seek(0)
    return output


def generate_excel_export(
    transactions: List[Transaction],
    currency_code: str = "USD",
    currency_symbol: str = "$",
) -> io.BytesIO:
    wb = openpyxl.Workbook()

    # Sheet 1: Transactions
    ws_tx = wb.active
    ws_tx.title = "Transactions"

    # Header styling (Solid dark slate, bold white text)
    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")

    headers = ["Date", "Type", "Category", f"Amount ({currency_symbol})", "Description", "Notes"]
    ws_tx.append(headers)

    for col_num in range(1, len(headers) + 1):
        cell = ws_tx.cell(row=1, column=col_num)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")

    total_expense = 0
    total_income = 0

    for tx in transactions:
        amt = tx.amount_cents / 100.0
        if tx.type == "expense":
            total_expense += tx.amount_cents
        elif tx.type == "income":
            total_income += tx.amount_cents

        cat_name = tx.category.name if tx.category else "Uncategorized"
        ws_tx.append([
            tx.date.isoformat(),
            tx.type.capitalize(),
            cat_name,
            amt,
            tx.description,
            tx.notes or "",
        ])

    # Sheet 2: Summary
    ws_sum = wb.create_sheet(title="Financial Summary")
    ws_sum.append([f"Vaultwise Financial Report Summary ({currency_code})"])
    ws_sum.cell(row=1, column=1).font = Font(name="Segoe UI", size=14, bold=True, color="0F172A")
    ws_sum.append([])
    ws_sum.append(["Metric", f"Amount ({currency_symbol})"])
    for col in (1, 2):
        ws_sum.cell(row=3, column=col).fill = header_fill
        ws_sum.cell(row=3, column=col).font = header_font

    ws_sum.append(["Total Income", total_income / 100.0])
    ws_sum.append(["Total Expenses", total_expense / 100.0])
    ws_sum.append(["Net Savings", (total_income - total_expense) / 100.0])
    ws_sum.append(["Transaction Count", len(transactions)])

    # Auto-adjust column widths
    for sheet in [ws_tx, ws_sum]:
        for col in sheet.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            col_letter = get_column_letter(col[0].column)
            sheet.column_dimensions[col_letter].width = max(max_len + 3, 12)

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf


SOLID_PALETTE = [
    colors.HexColor("#2563EB"),  # Royal Blue
    colors.HexColor("#10B981"),  # Emerald Green
    colors.HexColor("#F59E0B"),  # Amber
    colors.HexColor("#EF4444"),  # Crimson Red
    colors.HexColor("#8B5CF6"),  # Violet
    colors.HexColor("#06B6D4"),  # Cyan
    colors.HexColor("#EC4899"),  # Magenta Pink
    colors.HexColor("#64748B"),  # Slate Gray
]


def _find_logo_path() -> Optional[str]:
    """Find the brand logo file across common workspace locations."""
    curr = Path(__file__).resolve()
    candidates = [
        curr.parent.parent / "assets" / "logo.png",
        curr.parent.parent.parent.parent / "apps" / "web" / "public" / "logo.png",
        curr.parent.parent.parent.parent / "apps" / "desktop" / "assets" / "images" / "logo.png",
        Path("app/assets/logo.png").resolve(),
    ]
    for p in candidates:
        if p.is_file():
            return str(p)
    return None


class WatermarkCanvas(canvas.Canvas):
    """Custom canvas that renders a subtle brand logo watermark and page numbering on every page."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logo_path = _find_logo_path()
        self.font_reg, _ = _register_report_fonts()

    def showPage(self):
        self.saveState()
        try:
            if self.logo_path:
                if hasattr(self, "setFillAlpha"):
                    self.setFillAlpha(0.10)
                if hasattr(self, "setStrokeAlpha"):
                    self.setStrokeAlpha(0.10)
                size = 640
                x = (612 - size) / 2
                y = (792 - size) / 2
                self.drawImage(
                    self.logo_path,
                    x,
                    y,
                    width=size,
                    height=size,
                    mask="auto",
                    preserveAspectRatio=True,
                    anchor="c",
                )
            else:
                if hasattr(self, "setFillAlpha"):
                    self.setFillAlpha(0.09)
                self.setFont(self.font_reg, 95)
                self.setFillColor(colors.HexColor("#0F172A"))
                self.drawCentredString(306, 396, "VAULTWISE")
        except Exception:
            pass
        finally:
            self.restoreState()

        # 2. Consistent running footer on every page
        self.saveState()
        self.setFont(self.font_reg, 8)
        self.setFillColor(colors.HexColor("#94A3B8"))
        self.drawString(36, 20, "Vaultwise — Financial Statement (Your Money. Your Rules.)")
        self.drawRightString(576, 20, f"Page {self._pageNumber}")
        self.restoreState()

        super().showPage()


def _build_category_pie_chart(
    transactions: List[Transaction],
    type_filter: Optional[str] = None,
    currency_symbol: str = "$",
    font_name: str = "Helvetica",
) -> Optional[Drawing]:
    """Builds a vector pie chart drawing aggregating filtered transactions by category."""
    if type_filter == "income" or (not any(t.type == "expense" for t in transactions) and any(t.type == "income" for t in transactions)):
        target_txs = [t for t in transactions if t.type == "income"]
    else:
        target_txs = [t for t in transactions if t.type == "expense"]

    if not target_txs:
        return None

    cat_map = defaultdict(int)
    for t in target_txs:
        c_name = t.category.name if t.category else "Uncategorized"
        cat_map[c_name] += t.amount_cents

    sorted_cats = sorted(cat_map.items(), key=lambda x: x[1], reverse=True)
    total_cents = sum(c[1] for c in sorted_cats)
    if total_cents <= 0:
        return None

    # Limit to top 5 categories, combining small slices into 'Other' to maintain clean presentation
    if len(sorted_cats) > 6:
        chart_slices = sorted_cats[:5]
        other_cents = sum(c[1] for c in sorted_cats[5:])
        chart_slices.append(("Other", other_cents))
    else:
        chart_slices = sorted_cats

    drawing_width = 540
    drawing_height = 150
    d = Drawing(drawing_width, drawing_height)

    # Flat Neo-Brutalist card container
    d.add(
        Rect(
            0,
            0,
            drawing_width,
            drawing_height,
            rx=4,
            ry=4,
            fillColor=colors.HexColor("#F8FAFC"),
            strokeColor=colors.HexColor("#CBD5E1"),
            strokeWidth=1,
        )
    )

    pc = Pie()
    pc.x = 25
    pc.y = 12
    pc.width = 126
    pc.height = 126
    pc.data = [amt / 100.0 for _, amt in chart_slices]
    percentages = [(amt / total_cents) * 100 for _, amt in chart_slices]
    pc.labels = [f"{p:.0f}%" if p >= 6 else "" for p in percentages]
    pc.slices.strokeWidth = 1.2
    pc.slices.strokeColor = colors.white

    legend_pairs = []
    for i, ((cat_name, cents), pct) in enumerate(zip(chart_slices, percentages)):
        slice_color = SOLID_PALETTE[i % len(SOLID_PALETTE)]
        pc.slices[i].fillColor = slice_color
        amt_str = f"{currency_symbol}{cents / 100:.2f}"
        legend_pairs.append((slice_color, f"{cat_name}: {amt_str} ({pct:.1f}%)"))

    d.add(pc)

    legend = Legend()
    legend.alignment = "right"
    legend.x = 185
    legend.y = 136
    legend.dx = 9
    legend.dy = 9
    legend.dxTextSpace = 8
    legend.yGap = 4
    legend.fontName = font_name
    legend.fontSize = 8.5
    legend.boxAnchor = "nw"
    legend.columnMaximum = 6
    legend.strokeWidth = 0
    legend.colorNamePairs = legend_pairs
    d.add(legend)

    return d


def generate_pdf_report(
    transactions: List[Transaction],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_name: Optional[str] = None,
    type_filter: Optional[str] = None,
    currency_code: str = "USD",
    currency_symbol: str = "$",
) -> io.BytesIO:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )
    styles = getSampleStyleSheet()
    font_reg, font_bold = _register_report_fonts()

    # Custom styles adhering strictly to solid colors (no gradients)
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName=font_bold,
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName=font_reg,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=12,
    )
    section_style = ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontName=font_bold,
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=6,
        spaceAfter=6,
    )
    cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName=font_reg,
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1E293B"),
    )

    # Safe symbol handling for ReportLab: if using standard Helvetica (non-Unicode), fallback to currency_code
    if font_reg == "Helvetica" and any(ord(char) > 255 for char in currency_symbol):
        display_symbol = f"{currency_code} "
    else:
        display_symbol = currency_symbol

    story = []
    story.append(Paragraph("Vaultwise — Financial Statement", title_style))

    # Explicitly list the active currency and filter parameters in the statement subtitle
    filter_details = []
    filter_details.append(f"Currency: {currency_code} ({display_symbol.strip()})")
    filter_details.append(f"Period: {start_date.isoformat() if start_date else 'All'} to {end_date.isoformat() if end_date else 'All'}")
    if category_name:
        filter_details.append(f"Category: {category_name}")
    if type_filter:
        filter_details.append(f"Type: {type_filter.capitalize()}")

    subtitle_line = " • ".join(filter_details) + " • Generated by Vaultwise (Your Money. Your Rules.)"
    story.append(Paragraph(subtitle_line, subtitle_style))

    # Summary KPI calculations
    tot_exp = sum(tx.amount_cents for tx in transactions if tx.type == "expense")
    tot_inc = sum(tx.amount_cents for tx in transactions if tx.type == "income")
    net_sav = tot_inc - tot_exp

    summary_data = [
        ["Total Income", "Total Spending", "Net Savings", "Total Transactions"],
        [
            f"{display_symbol}{tot_inc / 100:.2f}",
            f"{display_symbol}{tot_exp / 100:.2f}",
            f"{'-' if net_sav < 0 else ''}{display_symbol}{abs(net_sav) / 100:.2f}",
            str(len(transactions)),
        ],
    ]
    summary_table = Table(summary_data, colWidths=[135, 135, 135, 135])
    summary_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), font_bold),
            ("FONTSIZE", (0, 0), (-1, 0), 9.5),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#F8FAFC")),
            ("TEXTCOLOR", (0, 1), (-1, 1), colors.HexColor("#0F172A")),
            ("FONTNAME", (0, 1), (-1, 1), font_bold),
            ("FONTSIZE", (0, 1), (-1, 1), 11.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ])
    )
    story.append(summary_table)
    story.append(Spacer(1, 10))

    # Category Breakdown Pie Chart
    chart_drawing = _build_category_pie_chart(
        transactions,
        type_filter=type_filter,
        currency_symbol=display_symbol,
        font_name=font_reg,
    )
    if chart_drawing is not None:
        chart_label = "Income Breakdown by Category" if (type_filter == "income" or (not any(t.type == "expense" for t in transactions) and any(t.type == "income" for t in transactions))) else "Spending Breakdown by Category"
        story.append(Paragraph(chart_label, section_style))
        story.append(chart_drawing)
        story.append(Spacer(1, 10))

    # Transactions Table (capped to latest 150 rows in single statement)
    story.append(Paragraph("Transaction History", section_style))
    table_data = [["Date", "Type", "Category", f"Amount ({display_symbol.strip()})", "Description"]]
    for tx in transactions[:150]:
        cat_name = tx.category.name if tx.category else "Uncategorized"
        amt_str = f"{display_symbol}{tx.amount_cents / 100:.2f}"
        table_data.append([
            tx.date.isoformat(),
            tx.type.capitalize(),
            cat_name,
            amt_str,
            Paragraph(tx.description[:40], cell_style),
        ])

    tx_table = Table(table_data, colWidths=[70, 60, 100, 75, 235])
    tx_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), font_bold),
            ("FONTSIZE", (0, 0), (-1, 0), 8.5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F5F9")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("FONTNAME", (0, 1), (-1, -1), font_reg),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ])
    )
    story.append(tx_table)

    # Render PDF document with WatermarkCanvas
    doc.build(story, canvasmaker=WatermarkCanvas)
    buf.seek(0)
    return buf

