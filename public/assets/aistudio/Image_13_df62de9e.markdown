---
name: Visual Engineering Laboratory
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#00687a'
  on-secondary: '#ffffff'
  secondary-container: '#57dffe'
  on-secondary-container: '#006172'
  tertiary: '#4d556b'
  on-tertiary: '#ffffff'
  tertiary-container: '#656d84'
  on-tertiary-container: '#eef0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
  telemetry-num:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies the atmosphere of an advanced optical and visual engineering skunkworks: immaculate cleanrooms, precision calibration rigs, laser optics, and micro-machined physical hardware. It merges high-utility scientific instrumentation with an elevated Scandinavian-minimalist architectural baseline.

### Brand Attributes & Tone
- **Precision Instrumentation:** Zero visual fluff. Interfaces behave like active diagnostic equipment and physical control decks rather than generic SaaS dashboards.
- **Sterile Elegance:** A hyper-clean, pure-white laboratory environment punctuated by deep matte-black fixtures, razor-sharp technical indices, and intense photonic accents.
- **Tactile Density:** High information efficiency balanced by strict modular spacing, microscopic technical readouts, and tactile hardware metaphors (recessed toggles, knurled thumbwheels, and status LEDs).

### Visual Aesthetic
The style is an ultra-clean, technical-functionalist aesthetic blending **Matte Black Industrial Hardware** with **Translucent HUD Overlays**. Surfaces are stark white and light titanium-slate, bound by hair-thin precision borders (0.5px to 1px) and punctuated with glowing micro-indicators.

## Colors

The palette establishes an ultra-clean laboratory background offset by deep slate-black hardware components, energized by photonic emission accents.

### Core Canvas & Surfaces
- **Canvas / Cleanroom Floor (`#F8FAFC`):** The ambient baseline. Highly luminous, neutral, non-distracting.
- **Primary Surface (`#FFFFFF`):** High-grade cleanroom panels, cards, and floating diagnostic modules.
- **Secondary Surface (`#F1F5F9`):** Recessed wells, tool trays, dock bays, and technical headers.
- **Border / Structural Grid (`#E2E8F0`):** Ultra-crisp delineation lines representing mechanical seams and panel gaps.

### Text & Contrast Hierarchy
- **Primary Text (`#0F172A`):** Deep ink-slate. Provides maximum optical contrast for telemetry and critical metrics.
- **Secondary Text (`#475569`):** Intermediate technical labels, active metadata, and system descriptors.
- **Muted Text (`#94A3B8`):** Coordinate axes, calibration marks, serial stamps, and secondary grid markers.

### Photonic & Telemetry Accents
- **Accent Blue (`#2563EB`):** Primary command state, focused laser paths, active system states, and primary CTAs.
- **Electric Cyan (`#06B6D4`):** Real-time telemetry, beam divergence gauges, high-frequency signal pulses, and interactive HUD highlights.
- **Success Green (`#10B981`):** Nominal telemetry, active circuit pass, and locked calibration targets.
- **Power Yellow (`#F59E0B`):** Voltage spikes, thermal warning thresholds, and standby mode states.
- **Error Red (`#EF4444`):** Optical misalignment, safety cutoff trips, and system critical alerts.

## Typography

The typographic hierarchy implements a high-contrast dual-family architecture:

1. **Inter:** Deployed for high-level structure, narrative headers, and system status dialogue. Set with tight tracking to evoke contemporary industrial precision.
2. **JetBrains Mono:** The primary voice of lab instrumentation, active telemetry, calibration controls, data tables, and status badges. Always displayed with deliberate, open tracking (`letter-spacing`) to guarantee zero ambiguity between alphanumeric characters during real-time data streaming.

### Usage Standards
- All system labels, unit tags, coordinates, and state monitors must use `label-sm` or `label-md` in uppercase (e.g., `SYS.CH_01 // ACTIVE`).
- Telemetry readouts must preserve tabular numerals (`tnum`) to eliminate layout jitter during high-rate data refreshes.

## Layout & Spacing

The layout is built upon an uncompromising **Rigid Modular Grid** calibrated to 4px sub-divisions and 8px foundational increments, reflecting the dimensional accuracy of optical breadboards.

### Layout Mechanics
- **Desktop (>= 1280px):** 12-column or 16-column modular technical grid. Left and right utility toolbars dock flush to viewport boundaries, housing continuous calibration monitors and command decks. Gutters: `1.5rem` (`24px`).
- **Tablet (768px - 1279px):** 8-column layout. Peripheral telemetry docks collapse into sliding glass HUD trays. Gutters: `1rem` (`16px`).
- **Mobile (< 768px):** 4-column layout. High-density vertical stacking. Visualizers maintain a fixed aspect ratio; floating HUD controls condense to a bottom-anchored instrument tray. Outer margin: `1rem` (`16px`).

### Technical Density
Whitespace in this system is functional, serving as deliberate optical isolation between distinct diagnostic clusters rather than decorative emptiness.

## Elevation & Depth

This system avoids soft, pillowy, drop-shadow-heavy metaphors. Instead, depth is conveyed through **machined structural relief**, **optical glass refraction**, and **layered precision planes**.

### Elevation Hierarchy
1. **Recessed Substrate (Level -1):** Inset surfaces (telemetry wells, graph basins) utilize a subtle inner border `#CBD5E1` and fill `#F1F5F9`. No outer shadows.
2. **Base Panel (Level 0):** Pure `#FFFFFF` panels seated directly on `#F8FAFC`, enclosed by a crisp `1px solid #E2E8F0` border.
3. **Elevated Instrument (Level 1):** Movable diagnostic modules. Border `1px solid #CBD5E1` with a micro shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
4. **Floating HUD Controls (Level 2):** Translucent command overlays hovering over real-time viewports. Surface uses `rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(12px)`, edged with a high-precision `1px solid rgba(255, 255, 255, 0.6)` top bevel and `1px solid #E2E8F0` outline. Drop shadow: `0 8px 24px -4px rgba(15, 23, 42, 0.08)`.
5. **Critical Intervention Modals (Level 3):** Matte black hardware frames (`#0F172A`) overlaying the viewport with an ambient scrim: `rgba(15, 23, 42, 0.4)` and ambient projection: `0 20px 35px -10px rgba(15, 23, 42, 0.25)`.

## Shapes

The physical geometry of this design system is driven by **precision-machined edges**. Roundedness is strictly constrained to Level 1 (`roundedness: 1`), keeping elements crisp, mechanical, and architectural.

### Curvature Rules
- **Standard Controls & Badges (`rounded` / 4px):** Applied to buttons, input fields, telemetry chips, and simulation badges. Just enough corner radius to soften industrial steel edges without feeling playful.
- **Panels & Viewport Enclosures (`rounded-lg` / 8px):** Applied to major instrument modules, simulation canvases, and floating glass HUD panels.
- **Interactive Knobs & Hardware Toggle Pucks (`rounded-full`):** Reserved exclusively for rotary controls, radial dial indicators, and status LED emitters.
- **Chamfered Accents:** Critical hardware modals and diagnostic badges may use a 45-degree corner clip (`clip-path: polygon(...)`) to emphasize aerospace hardware construction.

## Components

### Buttons & Actuators
- **Primary Actuator:** Deep matte black `#0F172A` background, pure white `#FFFFFF` label (`JetBrains Mono`, uppercase, tracking +0.05em). Hover shifts to `#1E293B` with an Electric Cyan `#06B6D4` 1px bottom accent line. Active state triggers a 1px downward translation.
- **Laser / Photonic Action:** Solid Accent Blue `#2563EB` fill, white typography. Glow hover effect: `0 0 12px rgba(37, 99, 235, 0.35)`.
- **Secondary / HUD Button:** Glass surface `rgba(255, 255, 255, 0.75)` with a 1px border `#E2E8F0`. Text is `#0F172A`. Hover border snaps to Accent Blue `#2563EB`.
- **Hardware Trigger:** Milled toggle switch with a machined aluminum base (`#E2E8F0`), deep inset track, and tactile toggle state.

### Interactive Simulation Badges & Chips
- Compact, monospaced status indicator tags.
- Background: `#F1F5F9`, border: `1px solid #CBD5E1`, typography: `JetBrains Mono` at `10px`.
- Prefix with a 6px status bead: Electric Cyan for active stream, Green for calibrated lock, Power Yellow for thermal throttle, Error Red for parity failure. Pulsing animation applied on active real-time data sync.

### Input Fields & Precision Sliders
- **Inputs:** Crisp `#FFFFFF` surface with `1px solid #CBD5E1`. JetBrains Mono typography. Floating label in `10px` uppercase slate. Focus state: crisp 1px `#2563EB` ring with zero soft glow blur.
- **Vernier Sliders:** Precision track with a 1px center hairline in `#CBD5E1`. Matte black square thumb with a single vertical Electric Cyan indicator line down its axis. Readout dynamically hovers above the thumb in a micro-HUD bubble.

### Cards & Modular Enclosures
- Primary containment unit for telemetry and graphics. Clean white `#FFFFFF` surface, `1px solid #E2E8F0` border, `8px` corner radius.
- Header contains an integrated hardware strip: `#F8FAFC` top shelf, `1px solid #E2E8F0` divider line, housing the module title in `Inter` semi-bold alongside real-time frame rate or latency metrics in `JetBrains Mono`.

### Checkboxes, Radios & Binary Switches
- **Checkboxes:** 14x14px square, `1px solid #94A3B8`. Checked state: matte black fill `#0F172A` with an Electric Cyan check vector.
- **Radio Buttons:** 14x14px concentric rings with a 6px solid center dot on active selection.
- **Rotary Binary Switch:** Skeuomorphic mechanical toggle simulating physical laboratory apparatus.

### Floating Glass HUD Overlays
- Floating toolbars situated atop simulation viewports.
- Frosted glass finish (`rgba(255, 255, 255, 0.82)`, `backdrop-filter: blur(14px)`).
- Edge highlights with micro-tooltips showing hotkeys (e.g., `[CMD+K]`, `[V]`, `[R]`).