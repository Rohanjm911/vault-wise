import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:desktop/main.dart';

void main() {
  setUpAll(() {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  });

  testWidgets('Vaultwise Desktop App Shell renders brand, navigation, and actions', (WidgetTester tester) async {
    // Set desktop window size
    tester.view.physicalSize = const Size(1280, 800);
    tester.view.devicePixelRatio = 1.0;

    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(const VaultwiseDesktopApp());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    // Verify Brand title & tagline
    expect(find.text('Vaultwise'), findsOneWidget);
    expect(find.text('Your Money. Your Rules.'), findsOneWidget);

    // Verify Primary Action Button
    expect(find.text('Add Transaction'), findsWidgets);

    // Verify Navigation Sidebar items
    expect(find.text('Dashboard'), findsOneWidget);
    expect(find.text('Transactions'), findsOneWidget);
    expect(find.text('Budgets'), findsOneWidget);
    expect(find.text('Spending History'), findsOneWidget);
    expect(find.text('Categories'), findsOneWidget);
    expect(find.text('Import / Export'), findsOneWidget);
    expect(find.text('Settings'), findsOneWidget);

    // Verify Offline Status Footer
    expect(find.text('Local Vault Active'), findsOneWidget);
    expect(find.text('100% Offline • No Cloud Sync'), findsOneWidget);
  });
}
