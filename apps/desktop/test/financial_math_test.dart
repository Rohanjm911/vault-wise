import 'package:flutter_test/flutter_test.dart';
import 'package:desktop/core/domain/financial_math.dart';

void main() {
  group('FinancialMath Domain Calculation Rules', () {
    test('Format Currency formats positive, zero, and negative cents without floating-point errors', () {
      expect(FinancialMath.formatCurrency(12345, symbol: '\$'), '\$123.45');
      expect(FinancialMath.formatCurrency(0, symbol: '\$'), '\$0.00');
      expect(FinancialMath.formatCurrency(50, symbol: '\$'), '\$0.50');
      expect(FinancialMath.formatCurrency(5, symbol: '\$'), '\$0.05');
      expect(FinancialMath.formatCurrency(-4500, symbol: '\$'), '-\$45.00');
      expect(FinancialMath.formatCurrency(100000000, symbol: '€'), '€1,000,000.00');
    });

    test('Remaining Budget accurately detects positive remaining and negative overspending', () {
      // 500.00 limit - 350.00 spent = 150.00 remaining
      expect(FinancialMath.calculateRemainingBudget(50000, 35000), 15000);

      // 500.00 limit - 600.00 spent = -100.00 (overspent)
      expect(FinancialMath.calculateRemainingBudget(50000, 60000), -10000);

      // 0 limit - 50.00 spent = -50.00 (overspent)
      expect(FinancialMath.calculateRemainingBudget(0, 5000), -5000);
    });

    test('Budget Utilization gracefully guards zero-budget division', () {
      // Zero budget limit must not throw ZeroDivisionError and must return null
      expect(FinancialMath.calculateBudgetUtilization(0, 10000), isNull);
      expect(FinancialMath.calculateBudgetUtilization(0, 0), isNull);

      // Normal utilization
      final utilNormal = FinancialMath.calculateBudgetUtilization(100000, 45000);
      expect(utilNormal, isNotNull);
      expect(utilNormal!, closeTo(45.0, 0.001));

      // Over 100% utilization
      final utilOver = FinancialMath.calculateBudgetUtilization(100000, 125000);
      expect(utilOver, isNotNull);
      expect(utilOver!, closeTo(125.0, 0.001));
    });

    test('Percentage Change safely handles zero denominator and empty historical baseline', () {
      // Zero previous period spending must not throw and must return null
      expect(FinancialMath.calculatePercentageChange(15000, 0), isNull);
      expect(FinancialMath.calculatePercentageChange(0, 0), isNull);

      // 100 to 150 -> +50%
      final growth = FinancialMath.calculatePercentageChange(15000, 10000);
      expect(growth, isNotNull);
      expect(growth!, closeTo(50.0, 0.001));

      // 100 to 75 -> -25%
      final reduction = FinancialMath.calculatePercentageChange(7500, 10000);
      expect(reduction, isNotNull);
      expect(reduction!, closeTo(-25.0, 0.001));

      // 100 to 0 -> -100%
      final droppedToZero = FinancialMath.calculatePercentageChange(0, 10000);
      expect(droppedToZero, isNotNull);
      expect(droppedToZero!, closeTo(-100.0, 0.001));
    });

    test('Parse Currency to Cents correctly parses decimal inputs', () {
      expect(FinancialMath.parseCurrencyToCents('123.45'), 12345);
      expect(FinancialMath.parseCurrencyToCents('\$123.45'), 12345);
      expect(FinancialMath.parseCurrencyToCents('0.99'), 99);
      expect(FinancialMath.parseCurrencyToCents('500'), 50000);
      expect(FinancialMath.parseCurrencyToCents('invalid'), 0);
    });
  });
}
