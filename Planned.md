You are a senior product designer and UX strategist. Redesign a real school website into a premium, conversion-focused digital platform.

Context:

The current website (Meclones Academy) is outdated in UI/UX, lacks strong visual hierarchy, weak call-to-actions, and does not effectively convert visitors (parents) into applicants.

Your goal is to redesign it into a modern, high-end school platform comparable to top international schools.

Product Scope:

- Public Website (Primary + Secondary combined system)

- Admissions system

- Fee payment system

- Admin / Teacher / Parent / Student dashboards

Design Goals:

- Premium, modern, calm, trustworthy

- Strong conversion focus (Admissions + Enquiries)

- Mobile-first responsive design

- Clear separation between Primary and Secondary

- Simple for parents, powerful for admin

Visual Style:

- White / off-white background

- Deep blue primary color

- Gold accent for premium feel

- Clean sans-serif typography

- Large hero sections

- Rounded cards and soft shadows

- High-quality image placeholders (students, classrooms, activities)

---

TASK 1: AUDIT & IMPROVEMENT STRATEGY

Analyze a typical outdated school website and identify:

- UI problems (layout, typography, spacing)

- UX problems (navigation, flow, clarity)

- Conversion problems (missing CTAs, weak messaging)

- Trust issues (lack of credibility signals)

Then define:

- What must be removed

- What must be improved

- What must be added

---

TASK 2: INFORMATION ARCHITECTURE (NEW STRUCTURE)

Design a better site structure:

Public Website:

- Home

- Primary School

- Secondary School

- About

- Admissions

- Fee Payment

- News/Events

- Contact

Portal:

- Login

- Admin Dashboard

- Teacher Dashboard

- Parent Dashboard

- Student Dashboard

---

TASK 3: WIREFRAMES (FIGMA-READY)

Create structured wireframes for:

1. Homepage (Desktop + Mobile)

2. Primary School Page

3. Secondary School Page

4. About Page

5. Admissions Page (Conversion-focused)

6. Fee Payment Page (Trust-focused)

7. Login Page

Dashboards:

8. Admin Dashboard

9. Teacher Dashboard

10. Parent Dashboard

11. Student Dashboard

For EACH screen, define:

- Frame size

- Layout sections (top → bottom)

- Components inside each section

- CTA placement

- Navigation behavior

- Responsive behavior

---

TASK 4: CONVERSION OPTIMIZATION

Redesign the experience so that:

Homepage flow:

Visitor → Understand school → Choose Primary/Secondary → Click → Apply

Admissions page:

Visitor → Understand process → Trust school → Fill form → Submit

Fee page:

Parent → Trust system → Pay quickly → Get confirmation

Add:

- Strong CTAs everywhere

- Trust signals (results, testimonials, stats)

- Clear school positioning

- Emotional + rational balance

---

TASK 5: DASHBOARD UX

Admin:

- Data-rich

- Fast decision-making

- Clear KPIs

Teacher:

- Fast actions (attendance, logs)

- Minimal friction

Parent:

- Reassuring, simple, clear

Student:

- Minimal, clean, distraction-free

---

TASK 6: COMPONENT SYSTEM

Define reusable components:

- Buttons (primary, secondary)

- Cards (school, stats, testimonial)

- Forms (input, select, validation)

- Tables

- Badges

- Notifications

- Chat UI

- Dashboard widgets

---

OUTPUT FORMAT:

- Clean structured wireframe spec

- Screen-by-screen breakdown

- No code

- No long explanations

- Clear enough to implement directly in Figma

---

IMPORTANT:

This is not just a redesign — it is a transformation into a premium digital product that can compete with top private schools.

Absolutely. Here is a premium-level wireframe blueprint you can use for Meclones College Combined School Digital Platform.

I am structuring it the way a real product designer would: information hierarchy first, visual flow second, then page-by-page layout.

---

1) Design direction

Use a look that feels:

* premium

* calm

* trustworthy

* parent-friendly

* school-appropriate

Visual style

* Background: white + very light cream

* Primary color: deep navy or royal blue

* Accent color: gold or warm yellow

* Secondary accent: soft green for success/fees/attendance

* Typography: clean sans-serif, strong headings, soft body text

* Components: rounded cards, gentle shadows, lots of spacing

UI feeling

Think:

* modern school website

* premium international school

* simple enough for parents on mobile

* serious enough for admin dashboard use

---

2) Global layout system

Desktop

* 12-column grid

* max content width: 1200px

* section padding: 80px top/bottom

* cards: 16–24px radius

* CTA buttons: bold, large, clear

Mobile

* single column

* sticky bottom or top CTA for “Apply Now” / “Pay Fees”

* collapsible menu

* large tap targets

---

3) Public website wireframes

A. Homepage

Desktop wireframe

```text

┌──────────────────────────────────────────────────────────────────────────┐

│ LOGO | Home | Primary | Secondary | About | Admissions | News | Contact │

│                                                             [Login]     │

├──────────────────────────────────────────────────────────────────────────┤

│ HERO SECTION                                                             │

│ ┌───────────────────────────────┐  ┌──────────────────────────────────┐ │

│ │ Headline + short subtext      │  │ Large school image / video       │ │

│ │ CTA: Explore Primary          │  │ or premium collage               │ │

│ │ CTA: Explore Secondary        │  │                                  │ │

│ └───────────────────────────────┘  └──────────────────────────────────┘ │

├──────────────────────────────────────────────────────────────────────────┤

│ SCHOOL SELECTOR CARDS                                                    │

│ ┌───────────────────┐  ┌───────────────────┐                            │

│ │ Primary School     │  │ Secondary School  │                            │

│ │ Nursery - Pry 6    │  │ JSS - SS3         │                            │

│ │ [Explore]          │  │ [Explore]         │                            │

│ └───────────────────┘  └───────────────────┘                            │

├──────────────────────────────────────────────────────────────────────────┤

│ STATS BAR                                                                │

│ 20 Years | 565 Students | 45 Teachers | 100% Excellence                  │

├──────────────────────────────────────────────────────────────────────────┤

│ WHY MECLONES                                                             │

│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                                       │

│ │icon  │ │icon  │ │icon  │ │icon  │                                       │

│ │Value │ │Value │ │Value │ │Value │                                       │

│ └──────┘ └──────┘ └──────┘ └──────┘                                       │

├──────────────────────────────────────────────────────────────────────────┤

│ TESTIMONIALS                                                             │

│ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐   │

│ │ parent quote       │ │ parent quote       │ │ parent quote       │   │

│ └────────────────────┘ └────────────────────┘ └────────────────────┘   │

├──────────────────────────────────────────────────────────────────────────┤

│ ADMISSION CTA BANNER                                                     │

│ "Now accepting applications..." [Apply Now]                              │

├──────────────────────────────────────────────────────────────────────────┤

│ FOOTER: address | phone | email | socials | quick links                  │

└──────────────────────────────────────────────────────────────────────────┘

```

Mobile wireframe

```text

┌──────────────────────┐

│ LOGO        [☰]     │

├──────────────────────┤

│ HERO IMAGE           │

│ Headline             │

│ Short subtext        │

│ [Primary]            │

│ [Secondary]          │

├──────────────────────┤

│ PRIMARY CARD         │

│ [Explore]            │

├──────────────────────┤

│ SECONDARY CARD       │

│ [Explore]            │

├──────────────────────┤

│ STATS BAR            │

├──────────────────────┤

│ WHY MECLONES         │

├──────────────────────┤

│ TESTIMONIALS         │

├──────────────────────┤

│ ADMISSION CTA        │

├──────────────────────┤

│ FOOTER               │

└──────────────────────┘

```

---

B. Primary School page

Structure

1. Hero

2. About Primary

3. Programmes

4. Curriculum highlights

5. Fee structure

6. Gallery

7. Admission CTA

Wireframe

```text

┌──────────────────────────────────────────────────────────────────┐

│ Hero: Primary School title + image + CTA                        │

├──────────────────────────────────────────────────────────────────┤

│ About Primary | class sizes | teacher ratio | safe environment   │

├──────────────────────────────────────────────────────────────────┤

│ Programmes cards                                                 │

│ Nursery 1 | Nursery 2 | Primary 1 | Primary 2 ... Primary 6      │

├──────────────────────────────────────────────────────────────────┤

│ Curriculum / learning features                                   │

├──────────────────────────────────────────────────────────────────┤

│ Fee structure table                                              │

├──────────────────────────────────────────────────────────────────┤

│ Primary gallery grid                                             │

├──────────────────────────────────────────────────────────────────┤

│ Admission CTA                                                   │

└──────────────────────────────────────────────────────────────────┘

```

---

C. Secondary School page

Structure

1. Hero

2. Overview

3. JSS / SS programme cards

4. Exam preparation

5. Results & achievements

6. Fee structure

7. Admission CTA

```text

┌──────────────────────────────────────────────────────────────────┐

│ Hero: Secondary School title + image + CTA                       │

├──────────────────────────────────────────────────────────────────┤

│ Overview + key stats + facilities                                │

├──────────────────────────────────────────────────────────────────┤

│ Programme cards: JSS 1–3 | SS 1–3                               │

├──────────────────────────────────────────────────────────────────┤

│ Exam prep section: WAEC | NECO | JAMB | IELTS | SAT              │

├──────────────────────────────────────────────────────────────────┤

│ Results / achievements highlight strip                           │

├──────────────────────────────────────────────────────────────────┤

│ Fee structure cards                                              │

├──────────────────────────────────────────────────────────────────┤

│ Admission CTA                                                   │

└──────────────────────────────────────────────────────────────────┘

```

---

D. Admissions page

This page should feel like a conversion page, not a normal info page.

Wireframe

```text

┌──────────────────────────────────────────────────────────┐

│ Hero: Apply for Admission                                │

├──────────────────────────────────────────────────────────┤

│ Step 1 | Step 2 | Step 3 | Step 4                         │

│ (Simple visual admission process)                        │

├──────────────────────────────────────────────────────────┤

│ Admission requirements                                   │

├──────────────────────────────────────────────────────────┤

│ Documents needed                                         │

├──────────────────────────────────────────────────────────┤

│ Fee / term dates / deadlines                             │

├──────────────────────────────────────────────────────────┤

│ Admission enquiry form                                   │

│ Parent name | Child name | class | phone | email         │

│ [Submit]                                                 │

├──────────────────────────────────────────────────────────┤

│ FAQ section                                              │

└──────────────────────────────────────────────────────────┘

```

Premium touch

Add a side panel on desktop:

* “Why parents choose Meclones”

* school benefits

* fast response promise

* contact button

---

E. Fee payment page

This should feel very trustworthy.

```text

┌──────────────────────────────────────────────────────────┐

│ Pay School Fees                                          │

├──────────────────────────────────────────────────────────┤

│ Select School: Primary / Secondary                       │

│ Select Class                                             │

│ Amount auto-fills                                        │

│ Parent name | Child name | Email                         │

│ [Pay Now with Paystack]                                  │

├──────────────────────────────────────────────────────────┤

│ Security note + payment logos + FAQs                      │

└──────────────────────────────────────────────────────────┘

```

---

4) Portal wireframes

A. Admin dashboard

This should feel premium and data-rich.

Desktop wireframe

```text

┌──────────────────────────────────────────────────────────────────────────┐

│ Top bar: logo | search | notifications | profile                         │

├───────────────┬──────────────────────────────────────────────────────────┤

│ Sidebar       │ Dashboard header + quick actions                        │

│ - Overview    │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     │

│ - Users       │ │Stat  │ │Stat  │ │Stat  │ │Stat  │                     │

│ - Attendance  │ └──────┘ └──────┘ └──────┘ └──────┘                     │

│ - Payments    │                                                          │

│ - Messages    │ Charts / attendance / fee summary / alerts               │

│ - Announce    │ ┌────────────────────┐ ┌────────────────────┐           │

│ - Reports     │ │ Attendance chart    │ │ Fee collection     │           │

│               │ └────────────────────┘ └────────────────────┘           │

│               │ Recent activity / pending admissions / alerts            │

└───────────────┴──────────────────────────────────────────────────────────┘

```

Mobile wireframe

```text

┌──────────────────────┐

│ Top bar + [☰]        │

├──────────────────────┤

│ Stat cards stacked   │

│ Chart card           │

│ Pending tasks        │

│ Quick actions        │

└──────────────────────┘

```

---

B. Teacher dashboard

Focus on speed and clarity.

```text

┌──────────────────────────────────────────────────────────┐

│ Teacher Dashboard                                       │

├──────────────────────────────────────────────────────────┤

│ Today summary: Classes | Attendance | Logs              │

├──────────────────────────────────────────────────────────┤

│ Quick actions                                            │

│ [Mark Attendance] [Resume Work] [Teaching Log]          │

├──────────────────────────────────────────────────────────┤

│ My Classes                                               │

│ ┌──────┐ ┌──────┐ ┌──────┐                               │

│ └──────┘ └──────┘ └──────┘                               │

├──────────────────────────────────────────────────────────┤

│ Messages from parents / notices                          │

└──────────────────────────────────────────────────────────┘

```

---

C. Student dashboard

Very simple, almost app-like.

```text

┌──────────────────────────────────────────────────────────┐

│ Student Dashboard                                        │

├──────────────────────────────────────────────────────────┤

│ Greeting + profile card                                  │

├──────────────────────────────────────────────────────────┤

│ Attendance summary | Notifications | Timetable           │

├──────────────────────────────────────────────────────────┤

│ Performance snapshot                                     │

├──────────────────────────────────────────────────────────┤

│ Recent announcements                                     │

└──────────────────────────────────────────────────────────┘

```

---

D. Parent dashboard

This must feel reassuring and easy.

```text

┌──────────────────────────────────────────────────────────┐

│ Parent Dashboard                                         │

├──────────────────────────────────────────────────────────┤

│ Child profile card                                       │

├──────────────────────────────────────────────────────────┤

│ Attendance | Fees | Messages | Notifications            │

├──────────────────────────────────────────────────────────┤

│ Recent absences / payments / teacher messages            │

├──────────────────────────────────────────────────────────┤

│ Fee payment button                                       │

└──────────────────────────────────────────────────────────┘

```

---

5) Premium UI components you should use

Use these everywhere:

* large rounded cards

* icon blocks with color

* charts in dashboard

* sticky top nav on website

* button hierarchy:

  * primary = solid color

  * secondary = outline

  * tertiary = text link

* consistent spacing

---

6) Best page flow for conversion

For the public site, the ideal user path is:

```text

Homepage → Primary/Secondary → Admissions → Fee Payment → Contact

```

For the portal, the ideal user path is:

```text

Login → Dashboard → Attendance / Messages / Payments / Reports

```

---

7) What makes this feel premium

A premium school system is not just pretty. It must feel:

* organized

* calm

* trusted

* polished

* easy to use on mobile

If you get these right, it will look far above most Nigerian school platforms.

---