# Fix black screen during auth loading

**Problem:** The splash screen hides immediately in `_layout.tsx`, before auth/onboarding state resolves. This causes a black flash or freeze.

**Fix (2 files):**

- [x] **`app/_layout.tsx`** — Move `SplashScreen.hideAsync()` into a callback that fires only after the `AuthProvider` has finished its initial session check. Instead of hiding on mount unconditionally, listen for auth loading to complete before dismissing the splash.

- [x] **`app/index.tsx`** — Add a lightweight inline loading fallback directly in the gate component (a simple centered `ActivityIndicator` on `Colors.background`) so there's zero dependency on `BackgroundView`/`ConcentricCircles` during the critical initial render path. This eliminates any risk of heavy components causing a blank frame.

The splash screen acts as the primary loading visual; the inline ActivityIndicator is the safety net that prevents any black frame from ever appearing.
