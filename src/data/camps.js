// Three featured European summer camps. Details come from the programmes' published information
// (2026 season, and 2027 where announced). Prices are on request.
const CAMPS = [
  {
    id: "aiglon-summer-camp",
    img: "/images/camps/aiglon.jpg",
    name: "Aiglon Summer Camp",
    country: "Switzerland",
    place: "Aiglon College, Villars-sur-Ollon, Swiss Alps",
    tagline: "Alpine adventure, sport and friendships in the Swiss mountains",
    ageMin: 8, ageMax: 16,
    ageLabel: "8–16",
    ageDetail: "Classic programme 8–12 · Eagle programme 13–16",
    months: ["Jun", "Jul"],
    when: "Late June to end of July, in weekly sessions",
    dates: ["27 Jun – 3 Jul", "4 – 10 Jul", "11 – 17 Jul", "18 – 24 Jul", "25 – 31 Jul"],
    datesNote: "These are the 2026 session dates. 2027 dates are confirmed on request.",
    length: "Residential: 2, 3 or 4 weeks · Day camp: 1 or 2 weeks",
    format: "Residential camp or day camp",
    cats: ["Adventure", "Sports & arts", "Language"],
    about: "Aiglon is a Swiss boarding school set high in the Alps above Villars-sur-Ollon. In summer, the campus hosts an international camp where children live, learn and play together in the mountains.",
    overview: [
      "The camp runs two programmes by age: Classic for 8 to 12 year-olds and Eagle for 13 to 16 year-olds. Children can join as boarders for two, three or four weeks, or as day campers for one or two weeks.",
      "Days mix outdoor adventure, sport, creative activities and language practice, in a small international community. It suits children who like being active, are ready to be away from home, and want to make friends from around the world."
    ],
    highlights: ["Two age-based programmes: Classic (8–12) and Eagle (13–16)", "Residential stays of 2–4 weeks, or 1–2 week day camp", "Stunning Alpine boarding-school campus", "Outdoor adventure, sports, arts and languages", "International mix of children"],
    programme: [["Outdoor adventure", "Mountain activities and team challenges that build confidence."], ["Sports", "A range of team and individual sports on the school's Alpine campus."], ["Arts and creativity", "Hands-on creative workshops and projects."], ["Languages", "Everyday practice in English and French among an international group."]],
    goodToKnow: ["Children aged 8–16 are welcome; the programme is chosen by age.", "Residential and day-camp places are available.", "Sessions are weekly, so families can choose the number of weeks.", "Final timetable and what to pack are sent after booking."],
    url: "https://www.aiglon.ch/2027-summer-camp"
  },
  {
    id: "pgl-adventure-camp",
    img: "/images/camps/pgl.avif",
    name: "PGL Adventure Camp",
    country: "United Kingdom",
    place: "Boreatton Park (Shropshire) and Liddington (Wiltshire), England",
    tagline: "Britain's best-known adventure camps: outdoor challenges, team games and new friends",
    ageMin: 8, ageMax: 16,
    ageLabel: "8–16",
    ageDetail: "Grouped by age: 8–11, 11–13 and 13–16",
    months: ["Jun", "Jul", "Aug"],
    when: "School holidays, June to August",
    dates: ["2 – 6 Aug 2027 (Boreatton Park, 4 nights)", "14 – 17 Aug 2027 (Liddington, 3 nights)", "16 – 20 Aug 2027 (Boreatton Park, 4 nights)"],
    datesNote: "These are sample 2027 departures. More dates run through the summer and the other holidays; the full calendar is confirmed on request.",
    length: "Residential stays of 2 to 7 nights",
    format: "Residential multi-activity camps, plus specialist camps such as pony camp",
    cats: ["Adventure", "Sports & arts"],
    about: "PGL is one of the UK's best-known providers of residential children's adventure holidays. Camps take place at large countryside centres where children try new activities, live away from home and make friends.",
    overview: [
      "The main camps are multi-activity breaks, where children rotate through a programme of outdoor and team challenges at a large activity centre. Specialist camps, such as a beginner pony camp, run for a full week.",
      "Children are grouped with others of a similar age (8 to 11, 11 to 13 and 13 to 16), which makes it a good first experience of being away from home. Stays are short enough for first-time campers, from a few nights up to a week."
    ],
    highlights: ["One of the UK's most established children's adventure-camp brands", "Large countryside centres in Shropshire and Wiltshire", "Multi-activity camps of 2 to 7 nights", "Specialist camps such as pony camp", "Children grouped by age: 8–11, 11–13 and 13–16"],
    programme: [["Multi-activity adventure", "A rotation of outdoor activities and team challenges, such as climbing, archery and canoeing (activities vary by centre and week)."], ["Team challenges", "Group games and problem-solving that build confidence and friendships."], ["Specialist camps", "Week-long options for a particular interest, for example pony camp for beginners."], ["Evenings", "Social activities and games with the rest of the group."]],
    goodToKnow: ["Open to children aged 8–16, grouped by age.", "Stays range from 2 to 7 nights, so it suits first-time campers.", "Centres are in the English countryside, reached by road from London and the airports.", "International bookings: please ask us, as availability and dates are confirmed on request."],
    url: "https://adventureholidays.pgl.co.uk/"
  },
  {
    id: "barcelona-spanish-summer-camp",
    img: "/images/camps/barcelona.jpg",
    name: "Spanish Summer Camp in Barcelona",
    country: "Spain",
    place: "Barcelona (Beach camp and City Centre camp)",
    tagline: "Learn Spanish by the sea with sport, beach days and new friends",
    ageMin: 5, ageMax: 18,
    ageLabel: "5–18",
    ageDetail: "Beach camp 5–15 · City Centre camp 14–18",
    months: ["Jun", "Jul", "Aug"],
    when: "Late June to early August, in weekly stays",
    dates: ["29 Jun – 2 Aug (2026 season, join for one or more weeks)"],
    datesNote: "These are the 2026 season dates. 2027 dates are confirmed on request.",
    length: "From 1 week up to the full season",
    format: "Residential camp, day camp or homestay",
    cats: ["Language", "Sports & arts"],
    about: "A Spanish-language summer camp in Barcelona with two settings: a beach camp for children and younger teens, and a city-centre camp for older teens. Lessons in the morning, activities and outings for the rest of the day.",
    overview: [
      "The Beach camp (ages 5 to 15) combines Spanish lessons with sport and beach life, while the City Centre camp (ages 14 to 18) puts older teens in the heart of Barcelona, close to its sights.",
      "Families can choose a residential camp, a day camp or a homestay, and stay for as many weeks as suit them. It suits children who want to pick up Spanish naturally while having fun."
    ],
    highlights: ["Two camps: Beach (5–15) and City Centre (14–18)", "Spanish lessons with games, sports and outings", "Residential, day camp or homestay options", "Weekly stays from late June to early August", "Barcelona's beaches and city sights on the doorstep"],
    programme: [["Spanish lessons", "Around 20 lessons a week, in small groups by level."], ["Sport", "Daily sports and games, including beach activities."], ["Outings", "Excursions around Barcelona and the coast."], ["Evening activities", "Games, shows and social activities with other campers."]],
    goodToKnow: ["Children from 5 to 18 are welcome, grouped by age.", "Choose residential, day camp or homestay.", "Beginners are welcome.", "Meals and activities are part of the camp programme; details are confirmed on booking."],
    url: "https://www.cervantes.to/barcelona/summer_programs.html"
  }
];

export { CAMPS };
