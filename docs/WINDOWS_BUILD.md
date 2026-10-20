# Vaultwise — Windows Desktop Build Guide

## 1. Prerequisites for Windows Desktop Development

To develop and build the native Windows desktop application for Vaultwise, ensure the following components are installed:

1. **Flutter SDK**:
   - Version: 3.47+ (Dart 3.13+)
   - Enable Windows desktop support:
     ```powershell
     flutter config --enable-windows-desktop
     ```
2. **Visual Studio 2022 / Build Tools**:
   - Workload required: **Desktop development with C++**
   - Recommended components:
     - MSVC v143 - VS 2022 C++ x64/x86 build tools
     - Windows 10/11 SDK (10.0.22000.0 or newer)
     - C++ CMake tools for Windows
3. **Windows 10 / 11 64-bit**.

---

## 2. Setting Up the Desktop Project

From the project root:

```powershell
cd apps/desktop
flutter pub get
```

### Verifying Environment:
```powershell
flutter doctor -v
```
Ensure `[√] Flutter` and `[√] Connected device (Windows desktop)` show healthy checkmarks.

---

## 3. Running & Testing Locally

### Running in Debug Mode:
```powershell
cd apps/desktop
flutter run -d windows
```

### Running Automated Tests:
```powershell
cd apps/desktop
flutter test
```

---

## 4. Building for Production

To create an optimized, release-mode native Windows executable:

```powershell
cd apps/desktop
flutter build windows --release
```

The resulting standalone executable and required DLLs will be output to:
`apps/desktop/build/windows/x64/runner/Release/`

### Artifacts in the Output Directory:
- `vaultwise.exe`: Main native Windows executable.
- `flutter_windows.dll`: Flutter desktop runtime engine.
- `sqflite_common_ffi.dll` / SQLCipher libraries for encrypted database support.
- `data/`: Flutter assets, fonts, and application manifests.

---

## 5. Security & Encryption Details on Windows

- **Database Path**: `%LOCALAPPDATA%\Vaultwise\vaultwise.db`
- **Encryption Key Storage**: Protected by Windows Data Protection API (DPAPI) and Windows Credential Manager via `flutter_secure_storage`.
- **Offline Integrity**: The application requires zero internet connectivity and performs no background telemetry.
