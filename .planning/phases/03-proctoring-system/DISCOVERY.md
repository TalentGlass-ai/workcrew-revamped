---
phase: 03-proctoring-system
type: discovery
research_mode: ecosystem
---

# Proctoring System Discovery

## Research Summary

Online proctoring involves monitoring remote assessments to prevent cheating. For coding assessments, key challenges include detecting copy-paste, external help, and identity verification.

## Standard Architecture Patterns

### Core Components
- **Identity Verification**: Webcam face detection, ID document upload
- **Screen Monitoring**: Screen recording, tab switching detection
- **Behavior Analysis**: Keystroke patterns, mouse movements, suspicious activities
- **Browser Lockdown**: Disable right-click, prevent external windows, fullscreen mode

### Implementation Approaches
1. **Third-party Services**: Proctorio, Examity, Honorlock - comprehensive but expensive
2. **Custom Implementation**: Use WebRTC for webcam/screen, browser APIs for lockdown
3. **Hybrid**: Basic lockdown + AI analysis for suspicious patterns

## Standard Stack

### Frontend
- WebRTC API for webcam/screen capture
- Screen Capture API (getDisplayMedia)
- Fullscreen API for lockdown
- Keyboard/mouse event monitoring

### Backend
- Video stream processing (optional, for AI analysis)
- Event logging and analysis
- Suspicious activity flagging

### Libraries
- `getUserMedia` for webcam access
- `getDisplayMedia` for screen sharing
- No major npm packages needed for basic implementation

## Common Pitfalls

### Technical
- Browser compatibility (Safari vs Chrome for screen capture)
- Permission handling (user must allow camera/screen)
- Performance impact of recording
- Storage of video data (privacy/GDPR concerns)

### UX
- Overly intrusive monitoring reduces candidate experience
- False positives in behavior detection
- Technical issues during assessment

### Security
- Client-side only monitoring can be bypassed
- Video tampering possible
- Network issues interrupting monitoring

## Recommended Approach

For WorkCrew's coding assessments:
- **Basic Lockdown**: Fullscreen, prevent tab switching, disable right-click
- **Webcam Verification**: Simple face detection at start
- **Event Logging**: Track keystrokes for copy-paste detection
- **Suspicious Flags**: Alert recruiters for manual review

Avoid full video recording due to privacy/storage concerns. Focus on behavioral indicators.

## Don't Hand-Roll

- Video analysis/AI detection (use existing services if needed)
- Advanced face recognition (complex, error-prone)
- Real-time video streaming (bandwidth intensive)

## Feasibility Assessment

**Feasible with current stack**: Yes, can extend Assessment.tsx with browser APIs
**Privacy compliant**: Basic monitoring without video storage
**Cheating resistance**: Moderate - deters obvious cheating, flags suspicious activity

## Next Steps

Implement basic monitoring layer in Assessment component, with recruiter dashboard for flagged assessments.