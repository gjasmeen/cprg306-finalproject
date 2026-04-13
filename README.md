# 🐵 FitMonkey – Fitness & Workout Tracker App

FitMonkey is a modern fitness and workout tracking web application designed to help users build healthy habits, track workouts, and stay consistent with their fitness journey.

Built with **Next.js**, **Supabase**, and **Firebase**, FitMonkey delivers a smooth, responsive, and scalable experience for managing workouts and personal progress.

---

## 🚀 Features

🏋️ **Workout Tracking**  
Create, manage, and track your workouts easily.

📊 **Progress Monitoring**  
Visualize your fitness progress over time.

📅 **Smart Scheduling**  
Plan workouts and stay consistent with your routine.

🔐 **Authentication System**  
Secure login and user management with Supabase Auth.

☁️ **Cloud Sync**  
Save and sync data using Supabase / Firebase.

📸 **Export & Share**  
Export workout summaries as images using `html-to-image`.

🎨 **Modern UI**  
Clean and responsive interface built with Tailwind CSS.

---

## 🛠️ Tech Stack

**Framework:** Next.js (App Router)  
**Frontend:** React 19  
**Styling:** Tailwind CSS  
**Backend / Database:** Supabase, Firebase  
**Language:** TypeScript  

### Libraries & Tools
- `@supabase/supabase-js`
- `@supabase/auth-helpers-nextjs`
- `@supabase/ssr`
- `firebase`
- `date-fns`
- `html-to-image`
- `lucide-react`

---

## 📁 Project Structure (Overview)

```bash
fitmonkey/
├── app/                 # Next.js App Router pages
├── components/         # Reusable UI components
├── lib/                # Utilities & service logic (Supabase/Firebase)
├── hooks/              # Custom React hooks
├── public/             # Static assets (images, icons)
├── styles/             # Global styles
├── package.json
