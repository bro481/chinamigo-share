(function () {
  const zhMap = {
    "China Guides": "中国指南",
    "Practical guides for easier travel in China.": "让中国旅行更轻松的实用指南。",
    "Payments, rail, apps, eSIM, hotels and local tips for international visitors.": "为国际访客准备的支付、高铁、App、eSIM、酒店与本地提示。",
    "Search payments, rail, apps, eSIM...": "搜索支付、高铁、App、eSIM...",
    "Categories": "分类",
    "Guides": "指南",
    "All Guides": "全部指南",
    "Featured Collections": "精选合集",
    "All": "全部",
    "Transportation": "交通",
    "Food & Cafés": "美食与咖啡",
    "Food & Cafes": "美食与咖啡",
    "Safety": "安全",
    "Hotels": "酒店",
    "Shopping": "购物",
    "Beauty & Wellness": "美容与健康",
    "First Time in China": "第一次来中国",
    "Digital China Essentials": "数字中国必备",
    "Getting Around China": "中国交通出行",
    "Local Life & Places": "本地生活与地点",
    "Arrival, payments, apps, rail and local basics for new visitors.": "为首次访客准备的抵达、支付、App、高铁和本地基础指南。",
    "Payments, mobile data, maps, translation and everyday apps.": "支付、移动网络、地图、翻译和日常 App。",
    "High-speed rail, taxis, metro, airports and city-to-city travel.": "高铁、出租车、地铁、机场和城市间交通。",
    "Food, neighborhoods, stays, shopping and hidden local spots.": "美食、街区、住宿、购物和隐藏本地地点。",
    "No guides found. Try another search or category.": "没有找到指南。试试其他搜索词或分类。",
    "Recommended order": "推荐阅读顺序",
    "Trips & Services": "行程与服务",
    "About": "关于我们",
    "Contact": "联系",
    "WhatsApp": "WhatsApp",
    "Chat on WhatsApp": "WhatsApp 咨询",
    "Explore Trips": "查看行程",
    "China Made": "让中国之旅",
    "Easy.": "更轻松。",
    "China MadeEasy.": "让中国之旅更轻松。",
    "Luxury travel and local support in China.": "面向国际访客的中国私人旅行与本地支持。",
    "Discover Modern China": "发现现代中国",
    "Modern China, Reimagined.": "重新理解现代中国。",
    "Practical guides, city ideas and private concierge support for international visitors.": "面向国际访客的实用指南、城市灵感与私人礼宾支持。",
    "Featured Experiences": "精选体验",
    "Short Experiences": "短途体验",
    "Recommended Journeys": "推荐行程",
    "Start with a city. We shape the rest around your pace.": "从一座城市开始，我们围绕你的节奏安排其余部分。",
    "Before you send the first message.": "发送第一条消息前。",
    "How quickly do you usually reply?": "通常多久回复？",
    "Most first messages receive a reply within one business day.": "大多数首次消息会在一个工作日内回复。",
    "Can we write in English?": "可以用英文沟通吗？",
    "Yes. We support English and Chinese communication before and during the journey.": "可以。行前和旅途中都支持英文与中文沟通。",
    "Do you create custom plans?": "可以定制行程吗？",
    "Yes. Share your dates, cities and travel style, and we will suggest the simplest next step.": "可以。告诉我们日期、城市和旅行风格，我们会建议最简单的下一步。",
    "Which cities do you cover?": "你们覆盖哪些城市？",
    "We support major China arrival cities and can discuss multi-city journeys case by case.": "我们支持中国主要入境城市，多城市行程可按具体情况沟通。",
    "Tell us where you are going. We will help shape the rest.": "告诉我们你要去哪里，其余部分我们来协助安排。",
    "Most journeys begin with a simple conversation. Send your dates, cities, travel style and the kind of support you may need.": "大多数行程都从一次简单沟通开始。告诉我们日期、城市、旅行风格和你可能需要的支持。",
    "Send a first message": "发送第一条消息",
    "Email": "邮箱",
    "Planning your China journey?": "正在计划你的中国之旅？",
    "Quiet concierge planning for international visitors.": "面向国际访客的安静私人行程协助。",
    "Private China Concierge": "中国私人礼宾服务",
    "China is easier with someone local.": "有本地人在，中国会更轻松。",
    "Practical local guidance before and during your trip, so each day feels calmer and easier.": "行前和旅途中都有实用的本地指引，让每一天都更从容、更轻松。",
    "From arrival to payments, transport and everyday questions, we help international visitors move through China with calm local guidance.": "从抵达到支付、交通和日常问题，我们用从容的本地指引帮助国际访客在中国旅行。",
    "Arrival": "抵达",
    "Payments": "支付",
    "Transport": "交通",
    "Apps": "应用",
    "Everyday Help": "日常帮助",
    "We help international visitors handle arrival, payments, transport, apps and day-to-day questions with calm local guidance.": "我们用从容的本地指引，帮助国际访客处理抵达、支付、交通、App 和日常问题。",
    "We help international visitors move through China with local guidance, flexible planning and practical support for transport, payments, apps and everyday moments.": "我们用本地指引、灵活规划，以及交通、支付、App 和日常细节支持，帮助国际访客更顺畅地在中国旅行。",
    "How ChinaMigo helps": "ChinaMigo 如何提供帮助",
    "Arrival support": "抵达支持",
    "Airport pickup, first-day timing and next steps.": "机场接送、第一天时间安排和下一步指引。",
    "Airport pickup, first-day timing and where to go next.": "机场接送、第一天时间安排，以及下一步该去哪里。",
    "Transport clarity": "交通更清楚",
    "High-speed rail, private cars and station transfers.": "高铁、私人用车和车站换乘。",
    "High-speed rail, private cars and station transfers made easier.": "高铁、私人用车和车站换乘会更容易。",
    "Daily local help": "日常本地协助",
    "Payments, apps and small questions handled calmly.": "支付、App 和小问题都会被从容处理。",
    "Payments, apps, translation and small questions handled calmly.": "支付、App、翻译和小问题都会被从容处理。",
    "Flexible private days": "灵活私人行程",
    "Plans shaped around weather, energy and pace.": "根据天气、体力和节奏调整安排。",
    "Plans shaped around weather, energy, family needs and pace.": "根据天气、体力、家庭需求和节奏调整安排。",
    "Why ChinaMigo": "为什么选择 ChinaMigo",
    "Built for the parts of China that feel unfamiliar.": "为中国旅行中容易感到陌生的部分而设计。",
    "Built for the moments that make China feel unfamiliar.": "为那些让中国显得陌生的时刻而设计。",
    "Arrive with confidence": "抵达时更安心",
    "Airport pickup, first-day timing and payment setup made easier.": "机场接送、第一天时间安排和支付设置会更容易。",
    "Payments, transport, apps and arrival details made easier before and during your trip.": "行前和旅途中，让支付、交通、App 和抵达细节更容易。",
    "Move like a local": "像本地人一样移动",
    "Move beyond landmarks": "不止于景点",
    "Routes shaped around real neighborhoods, food and daily life.": "路线围绕真实街区、食物和日常生活。",
    "Routes shaped around real neighborhoods, food, daily life and local rhythm, not only famous landmarks.": "路线围绕真实街区、食物、日常生活和本地节奏，而不只是著名景点。",
    "Travel without pressure": "没有压力地旅行",
    "Private days that can adjust around weather, energy and pace.": "私人行程可以根据天气、体力和节奏调整。",
    "Private, flexible days planned around your pace, family needs, weather and energy.": "私人灵活的一天，会围绕你的节奏、家庭需求、天气和体力来安排。",
    "Get practical help": "获得实际帮助",
    "Payments, apps, tickets and reservations handled more calmly.": "支付、App、票务和预订问题都能更从容地处理。",
    "Real moments": "真实瞬间",
    "Moments from the road.": "旅途中的真实片刻。",
    "A look at the routes, cafés, transfers and everyday scenes guests experience with ChinaMigo.": "看看客人与 ChinaMigo 一起经历的路线、咖啡馆、换乘和日常场景。",
    "Real travelers. Real local moments.": "真实旅行者。真实本地瞬间。",
    "Hosted across China, shaped by local people and the small details that make each day easier.": "由本地人参与设计与接待，关注那些让每天更轻松的小细节。",
    "Meet the people": "认识团队",
    "The people shaping each journey.": "塑造每段旅程的人。",
    "Local people behind the routes, messages and support.": "路线、沟通和支持背后的本地团队。",
    "Guoer": "Guoer",
    "Chongqing native · Photographer · Experience designer": "重庆本地人 · 摄影师 · 体验设计师",
    "Chongqing native · Photographer · Local experience designer": "重庆本地人 · 摄影师 · 本地体验设计师",
    "Designs routes around neighborhoods, food, light and real daily life.": "围绕街区、食物、光线和真实日常生活设计路线。",
    "Janet Zhang": "Janet Zhang",
    "Travel writer · Cultural tourism planner": "旅行作者 · 文化旅游策划",
    "Shapes stories, routes and guest communication for international travelers.": "为国际旅行者打磨故事、路线和客人沟通。",
    "Helps shape stories, routes and guest communication for international travelers.": "为国际旅行者打磨故事、路线和客人沟通。",
    "Local Guides": "本地向导",
    "English-speaking local hosts · Major Chinese cities": "英文接待本地向导 · 中国主要城市",
    "Help guests move through each day with context and calm.": "用语境和从容感帮助客人度过每一天。",
    "Support guests with local context, practical questions and flexible travel days.": "用本地语境、实际问题解答和灵活行程支持客人。",
    "What makes us different": "我们的不同之处",
    "How we differ from standard tours.": "我们和普通旅行团的不同。",
    "More local, more practical and less rushed than a standard tour.": "比普通旅行团更本地、更实用，也更不赶。",
    "Beyond landmarks": "不只看地标",
    "Classic highlights plus neighborhoods, markets, cafés and daily life.": "经典亮点之外，也有街区、市场、咖啡馆和日常生活。",
    "We include classic highlights, but also local neighborhoods, markets, cafés and everyday city life.": "我们会安排经典亮点，也会加入本地街区、市场、咖啡馆和日常城市生活。",
    "Everyday travel help": "日常旅行协助",
    "Payments, transport, apps, tickets and reservations made easier.": "支付、交通、App、票务和预订会更容易。",
    "Practical support": "实用支持",
    "We help with payments, transport, apps, tickets, reservations and small problems that often confuse first-time visitors.": "我们协助支付、交通、App、票务、预订，以及第一次来中国常遇到的小问题。",
    "No rushed group schedule. Routes can shift with weather, energy, kids, seniors or personal interests.": "没有赶场式团队行程。路线可以根据天气、体力、孩子、长辈或个人兴趣调整。",
    "Atmosphere-first planning": "先考虑氛围",
    "Timing, light and photo moments are considered from the start.": "从一开始就考虑时间、光线和适合拍照的瞬间。",
    "We consider timing, light, photo moments and local rhythm so the day feels natural, not mechanical.": "我们考虑时间、光线、拍照瞬间和本地节奏，让一天自然发生，而不是机械执行。",
    "Traveler notes": "旅行者笔记",
    "Small things guests remembered.": "客人记住的小事。",
    "First day felt easier": "第一天更轻松",
    "First arrival felt easier": "第一次抵达更轻松",
    "The pickup and payment setup made our first day in China much less stressful.": "接送和支付设置让我们在中国的第一天少了很多压力。",
    "— First-time visitor from Australia": "— 来自澳大利亚的首次访客",
    "Places we would not find alone": "那些我们自己找不到的地方",
    "Local moments, not tourist scenes": "本地瞬间，而不只是游客场景",
    "We saw neighborhoods and small places we would never have found on our own.": "我们看到了自己根本找不到的街区和小地方。",
    "— Couple traveler, United Kingdom": "— 来自英国的情侣旅行者",
    "The plan adjusted with us": "计划会跟着我们调整",
    "Flexible and personal": "灵活而个人化",
    "When our timing changed, the plan adjusted without making the day feel rushed.": "时间变化时，计划也跟着调整，但一天并没有变得匆忙。",
    "— Family traveler, Singapore": "— 来自新加坡的家庭旅行者",
    "Ready to plan your China stay?": "准备规划你的中国停留了吗？",
    "Tell us your city and travel dates. We’ll suggest the right next step.": "告诉我们你的城市和旅行日期，我们会建议合适的下一步。",
    "Tell us where you are going, and we will help shape the right route, support or local experience.": "告诉我们你要去哪里，我们会帮你安排合适的路线、支持或本地体验。",
    "Plan My China Trip": "规划我的中国之旅",
    "View Trips & Services →": "查看行程与服务 →",
    "Modern China moves fast. Your journey does not have to feel stressful.": "现代中国节奏很快，但你的旅程不必紧张。",
    "Airport pickup": "机场接送",
    "After a long flight, someone is already waiting for you.": "长途飞行后，已经有人在等你。",
    "High-speed rail support": "高铁协助",
    "Know where to go when the station feels too fast.": "车站节奏太快时，你也知道下一步该往哪里走。",
    "Translation help": "翻译协助",
    "Local support keeps difficult conversations moving.": "遇到沟通困难时，本地支持能让事情继续推进。",
    "Flexible timing": "灵活时间安排",
    "Plans change. Your journey adjusts quietly with them.": "计划会变化，行程也会安静地随之调整。",
    "Hotel coordination": "酒店协调",
    "Check-ins and local timing are arranged before arrival.": "入住、交通和本地时间安排会在抵达前协调好。",
    "Private transport": "私人交通",
    "Move across the city without figuring it out yourself.": "无需自己摸索，也能舒适地穿行城市。",
    "How we work": "我们的工作方式",
    "Private support, arranged before you arrive.": "私人支持，在你抵达前安排好。",
    "Traveling through China can feel unfamiliar at first.": "刚开始在中国旅行，可能会感到陌生。",
    "Airport arrivals, high-speed rail stations, payment setup, local timing and communication can quickly become stressful without support.": "机场抵达、高铁站、支付设置、本地时间和沟通，如果没有支持，很快就会变得紧张。",
    "We help coordinate those moments before you arrive, so the journey feels calmer once you are here.": "我们会在你抵达前协调这些环节，让你到达后更从容。",
    "Plan around your pace": "围绕你的节奏规划",
    "Cities, timing, hotel level, travel style and support expectations.": "城市、时间、酒店等级、旅行风格和支持需求。",
    "Coordinate the important moments": "协调重要时刻",
    "Airport pickup, station transfers, transport timing, reservations and local communication.": "机场接送、车站换乘、交通时间、预订和本地沟通。",
    "Adjust as the journey changes": "随着旅程变化调整",
    "Delayed trains, changing timing or unexpected moments are handled quietly along the way.": "列车延误、时间变化或意外情况，会在旅途中安静处理。",
    "Why we started": "为什么开始",
    "China can feel unfamiliar at first. We help you move through it more comfortably.": "中国一开始可能让人陌生。我们帮助你更舒适地进入其中。",
    "We have seen how quickly small moments can become stressful for international visitors.": "我们见过很多小瞬间如何迅速让国际访客感到紧张。",
    "Small moments": "小小的旅途瞬间",
    "Some visitors remembered the cities. Others remembered how calm the journey felt.": "有些访客记住了城市，有些则记住了旅程的从容感。",
    "Choose where your China journey begins.": "选择你的中国旅程从哪里开始。",
    "Curated local moments, slower walks and modern city rhythms.": "精选本地瞬间、慢步行走与现代城市节奏。",
    "Local Experiences": "本地体验",
    "Journeys": "行程",
    "Hidden Spots": "隐藏地点",
    "Where to Stay": "住在哪里",
    "Traditional Culture": "传统文化",
    "Scenic Views": "风景视野",
    "Art & Design": "艺术与设计",
    "Technology": "科技",
    "Local Food": "本地美食",
    "Breakfast": "早餐",
    "Coffee": "咖啡",
    "Bars": "酒吧",
    "Fine Dining": "精致餐饮",
    "Best Areas": "最佳区域",
    "Luxury Hotels": "奢华酒店",
    "Boutique Stays": "精品住宿",
    "A city of skyline mornings, historic lanes and modern lifestyles.": "一座拥有天际线清晨、历史街巷与现代生活方式的城市。",
    "Imperial routes, hutongs, food traditions and arrival support.": "皇家路线、胡同、饮食传统与抵达支持。",
    "Tech energy, design districts and practical business support.": "科技活力、设计街区与实用商务支持。",
    "Tea houses, food culture and relaxed neighborhood rhythm.": "茶馆、美食文化与松弛的街区节奏。",
    "Lakeside calm, wellness stays and refined city escapes.": "湖畔宁静、康养住宿与精致城市短途。",
    "Southern food, trade rhythm and practical city support.": "南方美食、商贸节奏与实用城市支持。",
    "Half-day and one-day ways into the city: culture, views, design and local rhythm.": "用半日或一日进入城市：文化、景观、设计与本地节奏。",
    "Multi-day curated routes with private planning, hotels, transport and local support.": "多日精选路线，包含私人规划、酒店、交通与本地支持。",
    "A curated feed of quieter places, local corners and non-obvious city moments.": "精选更安静的地方、本地角落和不那么显眼的城市瞬间。",
    "Area and stay guidance to make the city feel easier before you arrive.": "抵达前了解住宿区域与选择，让城市更容易进入。",
    "Need a custom route?": "需要定制路线？",
    "Tell us your travel rhythm, pace and preferred cities. We’ll shape a quieter China journey around you.": "告诉我们你的旅行节奏、步调和偏好的城市。我们会围绕你安排更安静的中国旅程。",
    "Send Inquiry": "发送咨询",
    "Sending...": "发送中...",
    "Inquiry received": "已收到咨询",
    "Continue on WhatsApp": "继续 WhatsApp 沟通",
    "Plan This Journey": "规划此行程",
    "Itinerary": "行程安排",
    "Included support": "包含支持",
    "Quiet support throughout the journey": "贯穿旅程的安静支持",
    "Login": "登录",
    "Log in": "登录",
    "Account": "账户",
    "Logout": "退出",
    "Language": "语言"
  };

  const coreTranslations = {
    ru: {
      "China Guides": "Гиды по Китаю",
      "Trips & Services": "Поездки и услуги",
      "About": "О нас",
      "Contact": "Контакты",
      "WhatsApp": "WhatsApp",
      "Chat on WhatsApp": "Написать в WhatsApp",
      "Log in": "Войти",
      "Account": "Аккаунт",
      "Logout": "Выйти",
      "Language": "Язык",
      "Plan My China Trip": "Спланировать поездку в Китай",
      "View Trips & Services →": "Посмотреть поездки и услуги →",
      "Private China Concierge": "Персональный консьерж в Китае",
      "China is easier with someone local.": "Китай проще с местным человеком рядом.",
      "Practical local guidance before and during your trip, so each day feels calmer and easier.": "Практичная местная поддержка до и во время поездки, чтобы каждый день был спокойнее и проще.",
      "Arrival": "Прибытие",
      "Payments": "Платежи",
      "Transport": "Транспорт",
      "Apps": "Приложения",
      "Everyday Help": "Повседневная помощь",
      "Why ChinaMigo": "Почему ChinaMigo",
      "Built for the parts of China that feel unfamiliar.": "Создано для тех частей Китая, которые кажутся непривычными.",
      "Arrive with confidence": "Приезжайте увереннее",
      "Airport pickup, first-day timing and payment setup made easier.": "Встреча в аэропорту, план первого дня и настройка платежей становятся проще.",
      "Move beyond landmarks": "Больше, чем достопримечательности",
      "Routes shaped around real neighborhoods, food and daily life.": "Маршруты вокруг настоящих районов, еды и повседневной жизни.",
      "Travel without pressure": "Путешествуйте без давления",
      "Private days that can adjust around weather, energy and pace.": "Индивидуальные дни, которые меняются под погоду, силы и ваш темп.",
      "Get practical help": "Получайте практичную помощь",
      "Payments, apps, tickets and reservations handled more calmly.": "Платежи, приложения, билеты и бронирования решаются спокойнее.",
      "Real moments": "Настоящие моменты",
      "Moments from the road.": "Моменты из поездок.",
      "A look at the routes, cafés, transfers and everyday scenes guests experience with ChinaMigo.": "Маршруты, кафе, трансферы и повседневные сцены, которые гости проживают с ChinaMigo.",
      "Meet the people": "Познакомьтесь с командой",
      "The people shaping each journey.": "Люди, которые создают каждое путешествие.",
      "Traveler notes": "Отзывы путешественников",
      "Small things guests remembered.": "Маленькие вещи, которые запомнились гостям.",
      "Ready to plan your China stay?": "Готовы спланировать поездку в Китай?",
      "Tell us your city and travel dates. We’ll suggest the right next step.": "Расскажите город и даты поездки. Мы подскажем следующий шаг.",
      "Practical guides for easier travel in China.": "Практичные гиды для более легкого путешествия по Китаю.",
      "Payments, rail, apps, eSIM, hotels and local tips for international visitors.": "Платежи, поезда, приложения, eSIM, отели и местные советы для иностранных гостей.",
      "Search payments, rail, apps, eSIM...": "Искать платежи, поезда, приложения, eSIM...",
      "All Guides": "Все гиды",
      "Featured Collections": "Подборки",
      "All": "Все",
      "Transportation": "Транспорт",
      "Food & Cafés": "Еда и кафе",
      "Safety": "Безопасность",
      "Hotels": "Отели",
      "Shopping": "Шопинг",
      "Beauty & Wellness": "Красота и wellness",
      "First Time in China": "Первый раз в Китае",
      "Digital China Essentials": "Цифровая жизнь в Китае",
      "Getting Around China": "Как передвигаться по Китаю",
      "Local Life & Places": "Местная жизнь и места",
      "Arrival, payments, apps, rail and local basics for new visitors.": "Прибытие, платежи, приложения, поезда и базовые советы для новых гостей.",
      "Payments, mobile data, maps, translation and everyday apps.": "Платежи, мобильный интернет, карты, перевод и повседневные приложения.",
      "High-speed rail, taxis, metro, airports and city-to-city travel.": "Скоростные поезда, такси, метро, аэропорты и поездки между городами.",
      "Food, neighborhoods, stays, shopping and hidden local spots.": "Еда, районы, проживание, покупки и скрытые местные места.",
      "Choose where your China journey begins.": "Выберите, где начнется ваше путешествие по Китаю.",
      "Curated local moments, slower walks and modern city rhythms.": "Отобранные местные моменты, неспешные прогулки и ритмы современного города.",
      "A city of skyline mornings, historic lanes and modern lifestyles.": "Город утренних горизонтов, исторических улочек и современного образа жизни.",
      "Local Experiences": "Местные впечатления",
      "Journeys": "Путешествия",
      "Hidden Spots": "Скрытые места",
      "Where to Stay": "Где остановиться",
      "Traditional Culture": "Традиционная культура",
      "Scenic Views": "Виды",
      "Art & Design": "Искусство и дизайн",
      "Technology": "Технологии",
      "Food": "Еда",
      "Coffee": "Кофе",
      "Bars": "Бары",
      "Fine Dining": "Высокая кухня",
      "Local Food": "Местная еда",
      "Breakfast": "Завтрак",
      "Start Planning": "Начать планирование",
      "View Experience": "Смотреть впечатление",
      "Need a custom route?": "Нужен индивидуальный маршрут?",
      "Send Inquiry": "Отправить запрос",
      "Continue on WhatsApp": "Продолжить в WhatsApp"
    },
    ja: {
      "China Guides": "中国ガイド",
      "Trips & Services": "旅程とサービス",
      "About": "私たちについて",
      "Contact": "お問い合わせ",
      "WhatsApp": "WhatsApp",
      "Chat on WhatsApp": "WhatsAppで相談",
      "Log in": "ログイン",
      "Account": "アカウント",
      "Logout": "ログアウト",
      "Language": "言語",
      "Plan My China Trip": "中国旅行を相談する",
      "View Trips & Services →": "旅程とサービスを見る →",
      "Private China Concierge": "中国プライベートコンシェルジュ",
      "China is easier with someone local.": "現地の人がいれば、中国はもっと旅しやすい。",
      "Practical local guidance before and during your trip, so each day feels calmer and easier.": "旅行前から旅行中まで、実用的な現地サポートで毎日をより安心に。",
      "Arrival": "到着",
      "Payments": "支払い",
      "Transport": "交通",
      "Apps": "アプリ",
      "Everyday Help": "日常サポート",
      "Why ChinaMigo": "ChinaMigoを選ぶ理由",
      "Built for the parts of China that feel unfamiliar.": "中国で不安に感じやすい部分のために作られています。",
      "Arrive with confidence": "安心して到着",
      "Airport pickup, first-day timing and payment setup made easier.": "空港送迎、初日の流れ、支払い設定をスムーズに。",
      "Move beyond landmarks": "名所だけではない体験へ",
      "Routes shaped around real neighborhoods, food and daily life.": "街の日常、食、リアルなエリアを中心にしたルート。",
      "Travel without pressure": "急がない旅",
      "Private days that can adjust around weather, energy and pace.": "天候、体力、ペースに合わせて調整できるプライベートな一日。",
      "Get practical help": "実用的なサポート",
      "Payments, apps, tickets and reservations handled more calmly.": "支払い、アプリ、チケット、予約も落ち着いて対応。",
      "Real moments": "実際の瞬間",
      "Moments from the road.": "旅の中の瞬間。",
      "A look at the routes, cafés, transfers and everyday scenes guests experience with ChinaMigo.": "ChinaMigoで体験するルート、カフェ、移動、日常の風景。",
      "Meet the people": "チーム紹介",
      "The people shaping each journey.": "旅を形にする人たち。",
      "Traveler notes": "旅行者の声",
      "Small things guests remembered.": "ゲストの心に残った小さなこと。",
      "Ready to plan your China stay?": "中国滞在を計画しますか？",
      "Tell us your city and travel dates. We’ll suggest the right next step.": "都市と日程を教えてください。次の一歩をご提案します。",
      "Practical guides for easier travel in China.": "中国旅行を楽にする実用ガイド。",
      "Payments, rail, apps, eSIM, hotels and local tips for international visitors.": "支払い、鉄道、アプリ、eSIM、ホテル、現地のヒント。",
      "Search payments, rail, apps, eSIM...": "支払い、鉄道、アプリ、eSIMを検索...",
      "All Guides": "すべてのガイド",
      "Featured Collections": "おすすめコレクション",
      "All": "すべて",
      "Transportation": "交通",
      "Food & Cafés": "食とカフェ",
      "Safety": "安全",
      "Hotels": "ホテル",
      "Shopping": "ショッピング",
      "Beauty & Wellness": "美容・ウェルネス",
      "First Time in China": "初めての中国",
      "Digital China Essentials": "中国デジタル必須ガイド",
      "Getting Around China": "中国の移動ガイド",
      "Local Life & Places": "ローカルライフと場所",
      "Arrival, payments, apps, rail and local basics for new visitors.": "到着、支払い、アプリ、鉄道、基本情報。",
      "Payments, mobile data, maps, translation and everyday apps.": "支払い、通信、地図、翻訳、日常アプリ。",
      "High-speed rail, taxis, metro, airports and city-to-city travel.": "高速鉄道、タクシー、地下鉄、空港、都市間移動。",
      "Food, neighborhoods, stays, shopping and hidden local spots.": "食、街歩き、宿泊、買い物、隠れたローカルスポット。",
      "Choose where your China journey begins.": "中国の旅を始める都市を選ぶ。",
      "Curated local moments, slower walks and modern city rhythms.": "厳選されたローカル体験、ゆっくり歩く街、現代中国のリズム。",
      "A city of skyline mornings, historic lanes and modern lifestyles.": "朝のスカイライン、歴史ある路地、現代的な暮らしが重なる街。",
      "Local Experiences": "ローカル体験",
      "Journeys": "ジャーニー",
      "Hidden Spots": "隠れた場所",
      "Where to Stay": "滞在エリア",
      "Traditional Culture": "伝統文化",
      "Scenic Views": "景色",
      "Art & Design": "アートとデザイン",
      "Technology": "テクノロジー",
      "Food": "食",
      "Coffee": "コーヒー",
      "Bars": "バー",
      "Fine Dining": "ファインダイニング",
      "Local Food": "ローカルフード",
      "Breakfast": "朝食",
      "Start Planning": "相談を始める",
      "View Experience": "体験を見る",
      "Need a custom route?": "カスタムルートが必要ですか？",
      "Send Inquiry": "問い合わせる",
      "Continue on WhatsApp": "WhatsAppで続ける"
    },
    ko: {
      "China Guides": "중국 가이드",
      "Trips & Services": "여행 & 서비스",
      "About": "소개",
      "Contact": "문의",
      "WhatsApp": "WhatsApp",
      "Chat on WhatsApp": "WhatsApp 상담",
      "Log in": "로그인",
      "Account": "계정",
      "Logout": "로그아웃",
      "Language": "언어",
      "Plan My China Trip": "중국 여행 계획하기",
      "View Trips & Services →": "여행 & 서비스 보기 →",
      "Private China Concierge": "중국 프라이빗 컨시어지",
      "China is easier with someone local.": "현지 사람이 함께하면 중국 여행은 더 쉬워집니다.",
      "Practical local guidance before and during your trip, so each day feels calmer and easier.": "여행 전과 중에 실용적인 현지 안내를 받아 매일을 더 편안하게 보낼 수 있습니다.",
      "Arrival": "도착",
      "Payments": "결제",
      "Transport": "교통",
      "Apps": "앱",
      "Everyday Help": "일상 도움",
      "Why ChinaMigo": "ChinaMigo를 선택하는 이유",
      "Built for the parts of China that feel unfamiliar.": "낯설게 느껴지는 중국 여행의 순간을 위해 만들었습니다.",
      "Arrive with confidence": "안심하고 도착",
      "Airport pickup, first-day timing and payment setup made easier.": "공항 픽업, 첫날 일정, 결제 설정을 더 쉽게.",
      "Move beyond landmarks": "명소를 넘어선 여행",
      "Routes shaped around real neighborhoods, food and daily life.": "실제 동네, 음식, 일상을 중심으로 만든 루트.",
      "Travel without pressure": "부담 없는 여행",
      "Private days that can adjust around weather, energy and pace.": "날씨, 컨디션, 속도에 맞춰 조정되는 프라이빗 일정.",
      "Get practical help": "실용적인 도움",
      "Payments, apps, tickets and reservations handled more calmly.": "결제, 앱, 티켓, 예약을 더 차분하게 처리합니다.",
      "Real moments": "진짜 순간",
      "Moments from the road.": "여정 속 순간들.",
      "A look at the routes, cafés, transfers and everyday scenes guests experience with ChinaMigo.": "ChinaMigo와 함께 경험하는 루트, 카페, 이동, 일상의 장면들.",
      "Meet the people": "팀 소개",
      "The people shaping each journey.": "각 여정을 만드는 사람들.",
      "Traveler notes": "여행자 노트",
      "Small things guests remembered.": "손님들이 기억한 작은 순간들.",
      "Ready to plan your China stay?": "중국 여행을 계획할 준비가 되셨나요?",
      "Tell us your city and travel dates. We’ll suggest the right next step.": "도시와 여행 날짜를 알려주시면 다음 단계를 제안해 드립니다.",
      "Practical guides for easier travel in China.": "중국 여행을 더 쉽게 하는 실용 가이드.",
      "Payments, rail, apps, eSIM, hotels and local tips for international visitors.": "해외 방문자를 위한 결제, 철도, 앱, eSIM, 호텔과 현지 팁.",
      "Search payments, rail, apps, eSIM...": "결제, 철도, 앱, eSIM 검색...",
      "All Guides": "전체 가이드",
      "Featured Collections": "추천 컬렉션",
      "All": "전체",
      "Transportation": "교통",
      "Food & Cafés": "음식 & 카페",
      "Safety": "안전",
      "Hotels": "호텔",
      "Shopping": "쇼핑",
      "Beauty & Wellness": "뷰티 & 웰니스",
      "First Time in China": "중국 첫 방문",
      "Digital China Essentials": "중국 디지털 필수 가이드",
      "Getting Around China": "중국 이동 가이드",
      "Local Life & Places": "현지 생활과 장소",
      "Choose where your China journey begins.": "중국 여행을 시작할 도시를 선택하세요.",
      "Curated local moments, slower walks and modern city rhythms.": "엄선된 현지 순간, 느린 산책, 현대 도시의 리듬.",
      "A city of skyline mornings, historic lanes and modern lifestyles.": "스카이라인 아침, 역사적인 골목, 현대적인 라이프스타일이 있는 도시.",
      "Local Experiences": "현지 경험",
      "Journeys": "여정",
      "Hidden Spots": "숨은 장소",
      "Where to Stay": "머물 곳",
      "Start Planning": "계획 시작",
      "View Experience": "경험 보기",
      "Need a custom route?": "맞춤 루트가 필요하신가요?",
      "Send Inquiry": "문의 보내기",
      "Continue on WhatsApp": "WhatsApp에서 계속"
    },
    th: {
      "China Guides": "คู่มือจีน",
      "Trips & Services": "ทริปและบริการ",
      "About": "เกี่ยวกับเรา",
      "Contact": "ติดต่อ",
      "WhatsApp": "WhatsApp",
      "Log in": "เข้าสู่ระบบ",
      "Plan My China Trip": "วางแผนทริปจีน",
      "View Trips & Services →": "ดูทริปและบริการ →",
      "Private China Concierge": "คอนเซียร์จส่วนตัวในจีน",
      "China is easier with someone local.": "จีนง่ายขึ้นเมื่อมีคนท้องถิ่นอยู่ข้างคุณ",
      "Practical local guidance before and during your trip, so each day feels calmer and easier.": "คำแนะนำท้องถิ่นที่ใช้ได้จริงก่อนและระหว่างทริป เพื่อให้แต่ละวันง่ายและสบายขึ้น",
      "Arrival": "การมาถึง",
      "Payments": "การชำระเงิน",
      "Transport": "การเดินทาง",
      "Apps": "แอป",
      "Everyday Help": "ความช่วยเหลือรายวัน",
      "Why ChinaMigo": "ทำไมต้อง ChinaMigo",
      "Built for the parts of China that feel unfamiliar.": "สร้างมาเพื่อช่วงเวลาที่จีนอาจรู้สึกไม่คุ้นเคย",
      "Arrive with confidence": "มาถึงอย่างมั่นใจ",
      "Move beyond landmarks": "มากกว่าสถานที่ดัง",
      "Travel without pressure": "เที่ยวแบบไม่กดดัน",
      "Get practical help": "รับความช่วยเหลือที่ใช้ได้จริง",
      "Practical guides for easier travel in China.": "คู่มือปฏิบัติสำหรับการเที่ยวจีนให้ง่ายขึ้น",
      "Payments, rail, apps, eSIM, hotels and local tips for international visitors.": "การชำระเงิน รถไฟ แอป eSIM โรงแรม และเคล็ดลับท้องถิ่น",
      "Search payments, rail, apps, eSIM...": "ค้นหาการชำระเงิน รถไฟ แอป eSIM...",
      "All Guides": "คู่มือทั้งหมด",
      "Featured Collections": "คอลเลกชันแนะนำ",
      "All": "ทั้งหมด",
      "Transportation": "การเดินทาง",
      "Food & Cafés": "อาหารและคาเฟ่",
      "Safety": "ความปลอดภัย",
      "Hotels": "โรงแรม",
      "Shopping": "ช้อปปิ้ง",
      "Beauty & Wellness": "ความงามและสุขภาพ",
      "Choose where your China journey begins.": "เลือกเมืองที่คุณอยากเริ่มต้นทริปจีน",
      "Curated local moments, slower walks and modern city rhythms.": "ประสบการณ์ท้องถิ่นที่คัดสรร การเดินช้า ๆ และจังหวะเมืองสมัยใหม่",
      "A city of skyline mornings, historic lanes and modern lifestyles.": "เมืองแห่งยามเช้ากับเส้นขอบฟ้า ตรอกประวัติศาสตร์ และไลฟ์สไตล์สมัยใหม่",
      "Local Experiences": "ประสบการณ์ท้องถิ่น",
      "Journeys": "เส้นทางท่องเที่ยว",
      "Hidden Spots": "สถานที่ลับ",
      "Where to Stay": "พักที่ไหนดี",
      "Start Planning": "เริ่มวางแผน",
      "View Experience": "ดูประสบการณ์"
    },
    fr: {
      "China Guides": "Guides Chine",
      "Trips & Services": "Voyages & services",
      "About": "À propos",
      "Contact": "Contact",
      "WhatsApp": "WhatsApp",
      "Log in": "Connexion",
      "Plan My China Trip": "Planifier mon voyage en Chine",
      "View Trips & Services →": "Voir voyages & services →",
      "Private China Concierge": "Conciergerie privée en Chine",
      "China is easier with someone local.": "La Chine est plus simple avec quelqu’un sur place.",
      "Practical local guidance before and during your trip, so each day feels calmer and easier.": "Des conseils locaux pratiques avant et pendant le voyage, pour des journées plus calmes et plus simples.",
      "Arrival": "Arrivée",
      "Payments": "Paiements",
      "Transport": "Transport",
      "Apps": "Apps",
      "Everyday Help": "Aide quotidienne",
      "Why ChinaMigo": "Pourquoi ChinaMigo",
      "Built for the parts of China that feel unfamiliar.": "Pensé pour les moments de Chine qui peuvent sembler déroutants.",
      "Arrive with confidence": "Arriver avec confiance",
      "Move beyond landmarks": "Au-delà des monuments",
      "Travel without pressure": "Voyager sans pression",
      "Get practical help": "Obtenir une aide pratique",
      "Practical guides for easier travel in China.": "Des guides pratiques pour voyager plus facilement en Chine.",
      "Payments, rail, apps, eSIM, hotels and local tips for international visitors.": "Paiements, train, apps, eSIM, hôtels et conseils locaux pour visiteurs internationaux.",
      "Search payments, rail, apps, eSIM...": "Rechercher paiements, train, apps, eSIM...",
      "All Guides": "Tous les guides",
      "Featured Collections": "Collections sélectionnées",
      "All": "Tous",
      "Transportation": "Transport",
      "Food & Cafés": "Restaurants & cafés",
      "Safety": "Sécurité",
      "Hotels": "Hôtels",
      "Shopping": "Shopping",
      "Beauty & Wellness": "Beauté & bien-être",
      "Choose where your China journey begins.": "Choisissez où commence votre voyage en Chine.",
      "Curated local moments, slower walks and modern city rhythms.": "Moments locaux choisis, promenades lentes et rythmes de ville moderne.",
      "A city of skyline mornings, historic lanes and modern lifestyles.": "Une ville de matins skyline, de ruelles historiques et de modes de vie modernes.",
      "Local Experiences": "Expériences locales",
      "Journeys": "Voyages",
      "Hidden Spots": "Lieux cachés",
      "Where to Stay": "Où dormir",
      "Start Planning": "Commencer à planifier",
      "View Experience": "Voir l’expérience"
    },
    es: {
      "China Guides": "Guías de China",
      "Trips & Services": "Viajes y servicios",
      "About": "Sobre nosotros",
      "Contact": "Contacto",
      "WhatsApp": "WhatsApp",
      "Log in": "Iniciar sesión",
      "Plan My China Trip": "Planificar mi viaje a China",
      "View Trips & Services →": "Ver viajes y servicios →",
      "Private China Concierge": "Conserjería privada en China",
      "China is easier with someone local.": "China es más fácil con alguien local.",
      "Practical local guidance before and during your trip, so each day feels calmer and easier.": "Orientación local práctica antes y durante el viaje, para que cada día sea más tranquilo y sencillo.",
      "Arrival": "Llegada",
      "Payments": "Pagos",
      "Transport": "Transporte",
      "Apps": "Apps",
      "Everyday Help": "Ayuda diaria",
      "Why ChinaMigo": "Por qué ChinaMigo",
      "Built for the parts of China that feel unfamiliar.": "Creado para las partes de China que pueden sentirse desconocidas.",
      "Arrive with confidence": "Llega con confianza",
      "Move beyond landmarks": "Más allá de los monumentos",
      "Travel without pressure": "Viaja sin presión",
      "Get practical help": "Recibe ayuda práctica",
      "Practical guides for easier travel in China.": "Guías prácticas para viajar más fácil por China.",
      "Payments, rail, apps, eSIM, hotels and local tips for international visitors.": "Pagos, tren, apps, eSIM, hoteles y consejos locales para visitantes internacionales.",
      "Search payments, rail, apps, eSIM...": "Buscar pagos, tren, apps, eSIM...",
      "All Guides": "Todas las guías",
      "Featured Collections": "Colecciones destacadas",
      "All": "Todo",
      "Transportation": "Transporte",
      "Food & Cafés": "Comida y cafés",
      "Safety": "Seguridad",
      "Hotels": "Hoteles",
      "Shopping": "Compras",
      "Beauty & Wellness": "Belleza y bienestar",
      "Choose where your China journey begins.": "Elige dónde empieza tu viaje por China.",
      "Curated local moments, slower walks and modern city rhythms.": "Momentos locales seleccionados, paseos tranquilos y ritmos urbanos modernos.",
      "A city of skyline mornings, historic lanes and modern lifestyles.": "Una ciudad de mañanas con skyline, calles históricas y vida moderna.",
      "Local Experiences": "Experiencias locales",
      "Journeys": "Viajes",
      "Hidden Spots": "Lugares ocultos",
      "Where to Stay": "Dónde alojarse",
      "Start Planning": "Empezar a planificar",
      "View Experience": "Ver experiencia"
    },
    pt: {
      "China Guides": "Guias da China",
      "Trips & Services": "Viagens e serviços",
      "About": "Sobre",
      "Contact": "Contato",
      "WhatsApp": "WhatsApp",
      "Log in": "Entrar",
      "Plan My China Trip": "Planejar minha viagem à China",
      "View Trips & Services →": "Ver viagens e serviços →",
      "Private China Concierge": "Concierge privado na China",
      "China is easier with someone local.": "A China fica mais fácil com alguém local.",
      "Practical local guidance before and during your trip, so each day feels calmer and easier.": "Orientação local prática antes e durante a viagem, para cada dia ser mais calmo e fácil.",
      "Arrival": "Chegada",
      "Payments": "Pagamentos",
      "Transport": "Transporte",
      "Apps": "Apps",
      "Everyday Help": "Ajuda diária",
      "Why ChinaMigo": "Por que ChinaMigo",
      "Built for the parts of China that feel unfamiliar.": "Feito para as partes da China que parecem desconhecidas.",
      "Arrive with confidence": "Chegue com confiança",
      "Move beyond landmarks": "Além dos pontos turísticos",
      "Travel without pressure": "Viaje sem pressão",
      "Get practical help": "Receba ajuda prática",
      "Practical guides for easier travel in China.": "Guias práticos para viajar pela China com mais facilidade.",
      "Payments, rail, apps, eSIM, hotels and local tips for international visitors.": "Pagamentos, trem, apps, eSIM, hotéis e dicas locais para visitantes internacionais.",
      "Search payments, rail, apps, eSIM...": "Buscar pagamentos, trem, apps, eSIM...",
      "All Guides": "Todos os guias",
      "Featured Collections": "Coleções selecionadas",
      "All": "Todos",
      "Transportation": "Transporte",
      "Food & Cafés": "Comida e cafés",
      "Safety": "Segurança",
      "Hotels": "Hotéis",
      "Shopping": "Compras",
      "Beauty & Wellness": "Beleza e bem-estar",
      "Choose where your China journey begins.": "Escolha onde começa sua viagem pela China.",
      "Curated local moments, slower walks and modern city rhythms.": "Momentos locais selecionados, caminhadas lentas e ritmos urbanos modernos.",
      "A city of skyline mornings, historic lanes and modern lifestyles.": "Uma cidade de manhãs com skyline, ruas históricas e estilo de vida moderno.",
      "Local Experiences": "Experiências locais",
      "Journeys": "Viagens",
      "Hidden Spots": "Lugares escondidos",
      "Where to Stay": "Onde ficar",
      "Start Planning": "Começar planejamento",
      "View Experience": "Ver experiência"
    },
    it: {
      "China Guides": "Guide Cina",
      "Trips & Services": "Viaggi e servizi",
      "About": "Chi siamo",
      "Contact": "Contatti",
      "WhatsApp": "WhatsApp",
      "Log in": "Accedi",
      "Plan My China Trip": "Pianifica il mio viaggio in Cina",
      "View Trips & Services →": "Vedi viaggi e servizi →",
      "Private China Concierge": "Concierge privata in Cina",
      "China is easier with someone local.": "La Cina è più semplice con qualcuno del posto.",
      "Practical local guidance before and during your trip, so each day feels calmer and easier.": "Supporto locale pratico prima e durante il viaggio, per giornate più calme e semplici.",
      "Arrival": "Arrivo",
      "Payments": "Pagamenti",
      "Transport": "Trasporti",
      "Apps": "App",
      "Everyday Help": "Aiuto quotidiano",
      "Why ChinaMigo": "Perché ChinaMigo",
      "Built for the parts of China that feel unfamiliar.": "Creato per le parti della Cina che possono sembrare poco familiari.",
      "Arrive with confidence": "Arriva con fiducia",
      "Move beyond landmarks": "Oltre i luoghi famosi",
      "Travel without pressure": "Viaggia senza pressione",
      "Get practical help": "Ricevi aiuto pratico",
      "Practical guides for easier travel in China.": "Guide pratiche per viaggiare più facilmente in Cina.",
      "Payments, rail, apps, eSIM, hotels and local tips for international visitors.": "Pagamenti, treni, app, eSIM, hotel e consigli locali per visitatori internazionali.",
      "Search payments, rail, apps, eSIM...": "Cerca pagamenti, treni, app, eSIM...",
      "All Guides": "Tutte le guide",
      "Featured Collections": "Raccolte in evidenza",
      "All": "Tutto",
      "Transportation": "Trasporti",
      "Food & Cafés": "Cibo e caffè",
      "Safety": "Sicurezza",
      "Hotels": "Hotel",
      "Shopping": "Shopping",
      "Beauty & Wellness": "Bellezza e benessere",
      "Choose where your China journey begins.": "Scegli dove inizia il tuo viaggio in Cina.",
      "Curated local moments, slower walks and modern city rhythms.": "Momenti locali curati, passeggiate lente e ritmi urbani moderni.",
      "A city of skyline mornings, historic lanes and modern lifestyles.": "Una città di mattine skyline, vicoli storici e lifestyle moderno.",
      "Local Experiences": "Esperienze locali",
      "Journeys": "Viaggi",
      "Hidden Spots": "Luoghi nascosti",
      "Where to Stay": "Dove soggiornare",
      "Start Planning": "Inizia a pianificare",
      "View Experience": "Vedi esperienza"
    },
    vi: {
      "China Guides": "Hướng dẫn Trung Quốc",
      "Trips & Services": "Chuyến đi & dịch vụ",
      "About": "Giới thiệu",
      "Contact": "Liên hệ",
      "WhatsApp": "WhatsApp",
      "Log in": "Đăng nhập",
      "Plan My China Trip": "Lên kế hoạch chuyến đi Trung Quốc",
      "View Trips & Services →": "Xem chuyến đi & dịch vụ →",
      "Private China Concierge": "Dịch vụ concierge riêng tại Trung Quốc",
      "China is easier with someone local.": "Trung Quốc dễ hơn khi có người địa phương đồng hành.",
      "Practical local guidance before and during your trip, so each day feels calmer and easier.": "Hướng dẫn địa phương thực tế trước và trong chuyến đi, giúp mỗi ngày nhẹ nhàng hơn.",
      "Arrival": "Đến nơi",
      "Payments": "Thanh toán",
      "Transport": "Di chuyển",
      "Apps": "Ứng dụng",
      "Everyday Help": "Hỗ trợ hằng ngày",
      "Why ChinaMigo": "Vì sao chọn ChinaMigo",
      "Built for the parts of China that feel unfamiliar.": "Dành cho những phần của Trung Quốc có thể còn xa lạ.",
      "Arrive with confidence": "Đến nơi tự tin hơn",
      "Move beyond landmarks": "Không chỉ là điểm nổi tiếng",
      "Travel without pressure": "Du lịch không áp lực",
      "Get practical help": "Nhận hỗ trợ thực tế",
      "Practical guides for easier travel in China.": "Hướng dẫn thực tế để du lịch Trung Quốc dễ hơn.",
      "Payments, rail, apps, eSIM, hotels and local tips for international visitors.": "Thanh toán, tàu, app, eSIM, khách sạn và mẹo địa phương.",
      "Search payments, rail, apps, eSIM...": "Tìm thanh toán, tàu, app, eSIM...",
      "All Guides": "Tất cả hướng dẫn",
      "Featured Collections": "Bộ sưu tập nổi bật",
      "All": "Tất cả",
      "Transportation": "Di chuyển",
      "Food & Cafés": "Ẩm thực & cà phê",
      "Safety": "An toàn",
      "Hotels": "Khách sạn",
      "Shopping": "Mua sắm",
      "Beauty & Wellness": "Làm đẹp & sức khỏe",
      "Choose where your China journey begins.": "Chọn nơi bắt đầu hành trình Trung Quốc của bạn.",
      "Curated local moments, slower walks and modern city rhythms.": "Khoảnh khắc địa phương được chọn lọc, nhịp đi chậm và hơi thở đô thị hiện đại.",
      "A city of skyline mornings, historic lanes and modern lifestyles.": "Một thành phố của buổi sáng skyline, ngõ phố lịch sử và lối sống hiện đại.",
      "Local Experiences": "Trải nghiệm địa phương",
      "Journeys": "Hành trình",
      "Hidden Spots": "Điểm ẩn",
      "Where to Stay": "Nơi lưu trú",
      "Start Planning": "Bắt đầu lên kế hoạch",
      "View Experience": "Xem trải nghiệm"
    },
    id: {
      "China Guides": "Panduan China",
      "Trips & Services": "Perjalanan & layanan",
      "About": "Tentang",
      "Contact": "Kontak",
      "WhatsApp": "WhatsApp",
      "Log in": "Masuk",
      "Plan My China Trip": "Rencanakan perjalanan China saya",
      "View Trips & Services →": "Lihat perjalanan & layanan →",
      "Private China Concierge": "Concierge pribadi di China",
      "China is easier with someone local.": "China lebih mudah dengan orang lokal.",
      "Practical local guidance before and during your trip, so each day feels calmer and easier.": "Panduan lokal praktis sebelum dan selama perjalanan agar setiap hari terasa lebih tenang dan mudah.",
      "Arrival": "Kedatangan",
      "Payments": "Pembayaran",
      "Transport": "Transportasi",
      "Apps": "Aplikasi",
      "Everyday Help": "Bantuan harian",
      "Why ChinaMigo": "Mengapa ChinaMigo",
      "Built for the parts of China that feel unfamiliar.": "Dibuat untuk bagian China yang terasa belum familiar.",
      "Arrive with confidence": "Tiba dengan percaya diri",
      "Move beyond landmarks": "Lebih dari sekadar landmark",
      "Travel without pressure": "Bepergian tanpa tekanan",
      "Get practical help": "Dapatkan bantuan praktis",
      "Practical guides for easier travel in China.": "Panduan praktis agar perjalanan di China lebih mudah.",
      "Payments, rail, apps, eSIM, hotels and local tips for international visitors.": "Pembayaran, kereta, aplikasi, eSIM, hotel, dan tips lokal.",
      "Search payments, rail, apps, eSIM...": "Cari pembayaran, kereta, aplikasi, eSIM...",
      "All Guides": "Semua panduan",
      "Featured Collections": "Koleksi pilihan",
      "All": "Semua",
      "Transportation": "Transportasi",
      "Food & Cafés": "Makanan & kafe",
      "Safety": "Keamanan",
      "Hotels": "Hotel",
      "Shopping": "Belanja",
      "Beauty & Wellness": "Kecantikan & kesehatan",
      "Choose where your China journey begins.": "Pilih tempat perjalanan China Anda dimulai.",
      "Curated local moments, slower walks and modern city rhythms.": "Momen lokal pilihan, jalan santai, dan ritme kota modern.",
      "A city of skyline mornings, historic lanes and modern lifestyles.": "Kota dengan pagi skyline, lorong bersejarah, dan gaya hidup modern.",
      "Local Experiences": "Pengalaman lokal",
      "Journeys": "Perjalanan",
      "Hidden Spots": "Tempat tersembunyi",
      "Where to Stay": "Tempat menginap",
      "Start Planning": "Mulai merencanakan",
      "View Experience": "Lihat pengalaman"
    }
  };
  const contactTranslations = {
    zh: {
      "Tell us your city, dates and travel needs.": "告诉我们你的城市、日期和旅行需求。",
      "Send us where you are going, when you arrive and what kind of support you need. We’ll suggest the right next step.": "告诉我们你要去哪里、何时抵达，以及需要哪类支持。我们会建议合适的下一步。",
      "Fast trip planning": "快速旅行规划",
      "Best for fast trip planning and questions.": "适合快速规划行程和咨询问题。",
      "Best for fast questions and trip planning.": "适合快速提问和行程规划。",
      "Add ChinaMigo on WeChat.": "在微信添加 ChinaMigo。",
      "For detailed requests or partnerships.": "适合详细需求或合作咨询。",
      "What to include": "建议包含",
      "What to include in your message": "消息里建议包含",
      "Destination city": "目的地城市",
      "Travel dates": "旅行日期",
      "Number of travelers": "旅行人数",
      "Arrival details": "抵达信息",
      "What you need help with": "你需要协助的事项",
      "Copy": "复制",
      "Copied": "已复制",
      "Copy failed": "复制失败"
    },
    ru: {
      "Tell us your city, dates and travel needs.": "Расскажите город, даты и что вам нужно в поездке.",
      "Send us where you are going, when you arrive and what kind of support you need. We’ll suggest the right next step.": "Напишите, куда вы едете, когда прибываете и какая помощь нужна. Мы подскажем следующий шаг.",
      "Fast trip planning": "Быстрое планирование",
      "Best for fast trip planning and questions.": "Лучше всего для быстрых вопросов и планирования.",
      "Best for fast questions and trip planning.": "Лучше всего для быстрых вопросов и планирования.",
      "Add ChinaMigo on WeChat.": "Добавьте ChinaMigo в WeChat.",
      "For detailed requests or partnerships.": "Для подробных запросов или партнерств.",
      "What to include": "Что указать",
      "What to include in your message": "Что указать в сообщении",
      "Destination city": "Город назначения",
      "Travel dates": "Даты поездки",
      "Number of travelers": "Количество путешественников",
      "Arrival details": "Детали прибытия",
      "What you need help with": "Какая помощь нужна",
      "Copy": "Копировать",
      "Copied": "Скопировано",
      "Copy failed": "Не удалось"
    },
    ja: {
      "Tell us your city, dates and travel needs.": "都市、日程、旅行で必要なサポートを教えてください。",
      "Send us where you are going, when you arrive and what kind of support you need. We’ll suggest the right next step.": "行き先、到着日、必要なサポートを送ってください。次の一歩をご提案します。",
      "Fast trip planning": "すばやい旅行相談",
      "Best for fast trip planning and questions.": "旅行計画や質問をすばやく相談するのに最適です。",
      "Best for fast questions and trip planning.": "質問や旅行計画をすばやく相談するのに最適です。",
      "Add ChinaMigo on WeChat.": "WeChatでChinaMigoを追加。",
      "For detailed requests or partnerships.": "詳しい依頼や提携相談に。",
      "What to include": "含める内容",
      "What to include in your message": "メッセージに入れる内容",
      "Destination city": "目的地の都市",
      "Travel dates": "旅行日程",
      "Number of travelers": "旅行人数",
      "Arrival details": "到着情報",
      "What you need help with": "必要なサポート",
      "Copy": "コピー",
      "Copied": "コピー済み",
      "Copy failed": "コピー失敗"
    },
    ko: {
      "Tell us your city, dates and travel needs.": "도시, 날짜, 여행 지원이 필요한 내용을 알려주세요.",
      "Send us where you are going, when you arrive and what kind of support you need. We’ll suggest the right next step.": "어디로 가는지, 언제 도착하는지, 어떤 도움이 필요한지 보내주시면 다음 단계를 제안해 드립니다.",
      "Fast trip planning": "빠른 여행 상담",
      "Best for fast trip planning and questions.": "빠른 여행 계획과 질문에 가장 좋습니다.",
      "Best for fast questions and trip planning.": "빠른 질문과 여행 계획에 가장 좋습니다.",
      "Add ChinaMigo on WeChat.": "WeChat에서 ChinaMigo를 추가하세요.",
      "For detailed requests or partnerships.": "상세 요청이나 파트너십 문의용.",
      "What to include": "포함할 내용",
      "What to include in your message": "메시지에 포함할 내용",
      "Destination city": "목적 도시",
      "Travel dates": "여행 날짜",
      "Number of travelers": "여행 인원",
      "Arrival details": "도착 정보",
      "What you need help with": "도움이 필요한 내용",
      "Copy": "복사",
      "Copied": "복사됨",
      "Copy failed": "복사 실패"
    },
    th: {
      "Tell us your city, dates and travel needs.": "บอกเมือง วันที่ และความต้องการเดินทางของคุณ",
      "Send us where you are going, when you arrive and what kind of support you need. We’ll suggest the right next step.": "ส่งเมืองที่จะไป เวลาที่มาถึง และสิ่งที่ต้องการให้ช่วย เราจะแนะนำขั้นตอนถัดไป",
      "Fast trip planning": "วางแผนทริปอย่างรวดเร็ว",
      "Best for fast trip planning and questions.": "เหมาะสำหรับถามคำถามและวางแผนทริปเร็ว ๆ",
      "Best for fast questions and trip planning.": "เหมาะสำหรับคำถามด่วนและการวางแผนทริป",
      "Add ChinaMigo on WeChat.": "เพิ่ม ChinaMigo ใน WeChat",
      "For detailed requests or partnerships.": "สำหรับคำขอละเอียดหรือความร่วมมือ",
      "What to include": "ควรใส่อะไร",
      "What to include in your message": "ควรใส่อะไรในข้อความ",
      "Destination city": "เมืองปลายทาง",
      "Travel dates": "วันที่เดินทาง",
      "Number of travelers": "จำนวนผู้เดินทาง",
      "Arrival details": "รายละเอียดการมาถึง",
      "What you need help with": "สิ่งที่ต้องการให้ช่วย",
      "Copy": "คัดลอก",
      "Copied": "คัดลอกแล้ว",
      "Copy failed": "คัดลอกไม่สำเร็จ"
    },
    fr: {
      "Tell us your city, dates and travel needs.": "Indiquez votre ville, vos dates et vos besoins de voyage.",
      "Send us where you are going, when you arrive and what kind of support you need. We’ll suggest the right next step.": "Envoyez-nous votre destination, votre arrivée et le type d’aide souhaité. Nous vous proposerons la prochaine étape.",
      "Fast trip planning": "Planification rapide",
      "Best for fast trip planning and questions.": "Idéal pour planifier vite et poser des questions.",
      "Best for fast questions and trip planning.": "Idéal pour questions rapides et planification.",
      "Add ChinaMigo on WeChat.": "Ajoutez ChinaMigo sur WeChat.",
      "For detailed requests or partnerships.": "Pour demandes détaillées ou partenariats.",
      "What to include": "À inclure",
      "What to include in your message": "À inclure dans votre message",
      "Destination city": "Ville de destination",
      "Travel dates": "Dates de voyage",
      "Number of travelers": "Nombre de voyageurs",
      "Arrival details": "Détails d’arrivée",
      "What you need help with": "Ce dont vous avez besoin",
      "Copy": "Copier",
      "Copied": "Copié",
      "Copy failed": "Échec"
    },
    es: {
      "Tell us your city, dates and travel needs.": "Cuéntanos tu ciudad, fechas y necesidades de viaje.",
      "Send us where you are going, when you arrive and what kind of support you need. We’ll suggest the right next step.": "Envíanos a dónde vas, cuándo llegas y qué tipo de ayuda necesitas. Te sugeriremos el siguiente paso.",
      "Fast trip planning": "Planificación rápida",
      "Best for fast trip planning and questions.": "Ideal para planificación rápida y preguntas.",
      "Best for fast questions and trip planning.": "Ideal para preguntas rápidas y planificación.",
      "Add ChinaMigo on WeChat.": "Añade ChinaMigo en WeChat.",
      "For detailed requests or partnerships.": "Para solicitudes detalladas o alianzas.",
      "What to include": "Qué incluir",
      "What to include in your message": "Qué incluir en tu mensaje",
      "Destination city": "Ciudad de destino",
      "Travel dates": "Fechas de viaje",
      "Number of travelers": "Número de viajeros",
      "Arrival details": "Detalles de llegada",
      "What you need help with": "En qué necesitas ayuda",
      "Copy": "Copiar",
      "Copied": "Copiado",
      "Copy failed": "Error"
    },
    pt: {
      "Tell us your city, dates and travel needs.": "Conte sua cidade, datas e necessidades de viagem.",
      "Send us where you are going, when you arrive and what kind of support you need. We’ll suggest the right next step.": "Envie para onde vai, quando chega e que tipo de apoio precisa. Vamos sugerir o próximo passo.",
      "Fast trip planning": "Planejamento rápido",
      "Best for fast trip planning and questions.": "Ideal para planejar rápido e tirar dúvidas.",
      "Best for fast questions and trip planning.": "Ideal para dúvidas rápidas e planejamento.",
      "Add ChinaMigo on WeChat.": "Adicione ChinaMigo no WeChat.",
      "For detailed requests or partnerships.": "Para pedidos detalhados ou parcerias.",
      "What to include": "O que incluir",
      "What to include in your message": "O que incluir na mensagem",
      "Destination city": "Cidade de destino",
      "Travel dates": "Datas da viagem",
      "Number of travelers": "Número de viajantes",
      "Arrival details": "Detalhes de chegada",
      "What you need help with": "Em que precisa de ajuda",
      "Copy": "Copiar",
      "Copied": "Copiado",
      "Copy failed": "Falhou"
    },
    it: {
      "Tell us your city, dates and travel needs.": "Dicci città, date e bisogni di viaggio.",
      "Send us where you are going, when you arrive and what kind of support you need. We’ll suggest the right next step.": "Scrivici dove vai, quando arrivi e che supporto ti serve. Ti suggeriremo il prossimo passo.",
      "Fast trip planning": "Pianificazione rapida",
      "Best for fast trip planning and questions.": "Ideale per pianificare rapidamente e fare domande.",
      "Best for fast questions and trip planning.": "Ideale per domande rapide e pianificazione.",
      "Add ChinaMigo on WeChat.": "Aggiungi ChinaMigo su WeChat.",
      "For detailed requests or partnerships.": "Per richieste dettagliate o partnership.",
      "What to include": "Cosa includere",
      "What to include in your message": "Cosa includere nel messaggio",
      "Destination city": "Città di destinazione",
      "Travel dates": "Date di viaggio",
      "Number of travelers": "Numero di viaggiatori",
      "Arrival details": "Dettagli di arrivo",
      "What you need help with": "Di cosa hai bisogno",
      "Copy": "Copia",
      "Copied": "Copiato",
      "Copy failed": "Errore"
    },
    vi: {
      "Tell us your city, dates and travel needs.": "Cho chúng tôi biết thành phố, ngày đi và nhu cầu hỗ trợ.",
      "Send us where you are going, when you arrive and what kind of support you need. We’ll suggest the right next step.": "Gửi nơi bạn đến, thời gian đến và loại hỗ trợ bạn cần. Chúng tôi sẽ gợi ý bước tiếp theo.",
      "Fast trip planning": "Lên kế hoạch nhanh",
      "Best for fast trip planning and questions.": "Phù hợp để hỏi nhanh và lên kế hoạch chuyến đi.",
      "Best for fast questions and trip planning.": "Phù hợp cho câu hỏi nhanh và lên kế hoạch.",
      "Add ChinaMigo on WeChat.": "Thêm ChinaMigo trên WeChat.",
      "For detailed requests or partnerships.": "Cho yêu cầu chi tiết hoặc hợp tác.",
      "What to include": "Nên có",
      "What to include in your message": "Nên có trong tin nhắn",
      "Destination city": "Thành phố đến",
      "Travel dates": "Ngày đi",
      "Number of travelers": "Số người đi",
      "Arrival details": "Thông tin đến nơi",
      "What you need help with": "Bạn cần hỗ trợ gì",
      "Copy": "Sao chép",
      "Copied": "Đã sao chép",
      "Copy failed": "Không thành công"
    },
    id: {
      "Tell us your city, dates and travel needs.": "Beri tahu kota, tanggal, dan kebutuhan perjalanan Anda.",
      "Send us where you are going, when you arrive and what kind of support you need. We’ll suggest the right next step.": "Kirim tujuan, waktu kedatangan, dan bantuan yang Anda butuhkan. Kami akan menyarankan langkah berikutnya.",
      "Fast trip planning": "Perencanaan cepat",
      "Best for fast trip planning and questions.": "Terbaik untuk rencana cepat dan pertanyaan.",
      "Best for fast questions and trip planning.": "Terbaik untuk pertanyaan cepat dan perencanaan.",
      "Add ChinaMigo on WeChat.": "Tambahkan ChinaMigo di WeChat.",
      "For detailed requests or partnerships.": "Untuk permintaan detail atau kemitraan.",
      "What to include": "Yang disertakan",
      "What to include in your message": "Yang perlu disertakan",
      "Destination city": "Kota tujuan",
      "Travel dates": "Tanggal perjalanan",
      "Number of travelers": "Jumlah pelancong",
      "Arrival details": "Detail kedatangan",
      "What you need help with": "Bantuan yang dibutuhkan",
      "Copy": "Salin",
      "Copied": "Disalin",
      "Copy failed": "Gagal"
    }
  };
  Object.entries(contactTranslations).forEach(([lang, map]) => {
    if (lang === "zh") Object.assign(zhMap, map);
    else Object.assign(coreTranslations[lang] ||= {}, map);
  });
  const translations = { zh: zhMap, ...coreTranslations };
  const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT"]);
  const languages = [
    { code: "en", label: "English", flag: "🇺🇸", htmlLang: "en" },
    { code: "zh", label: "中文", flag: "🇨🇳", htmlLang: "zh-CN" },
    { code: "ru", label: "Русский", flag: "🇷🇺", htmlLang: "ru" },
    { code: "ja", label: "日本語", flag: "🇯🇵", htmlLang: "ja" },
    { code: "ko", label: "한국어", flag: "🇰🇷", htmlLang: "ko" },
    { code: "th", label: "ไทย", flag: "🇹🇭", htmlLang: "th" },
    { code: "fr", label: "Français", flag: "🇫🇷", htmlLang: "fr" },
    { code: "es", label: "Español", flag: "🇪🇸", htmlLang: "es" },
    { code: "pt", label: "Português", flag: "🇵🇹", htmlLang: "pt" },
    { code: "it", label: "Italiano", flag: "🇮🇹", htmlLang: "it" },
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳", htmlLang: "vi" },
    { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩", htmlLang: "id" }
  ];
  const languageByCode = Object.fromEntries(languages.map((language) => [language.code, language]));
  const memoryStore = {};
  const isStaticPreview = Boolean(window.__CHINAMIGO_STATIC__);
  const storage = {
    get(key) {
      try {
        return window.localStorage?.getItem(key) || memoryStore[key] || "";
      } catch {
        return memoryStore[key] || "";
      }
    },
    set(key, value) {
      memoryStore[key] = value;
      try {
        window.localStorage?.setItem(key, value);
      } catch {}
    },
    remove(key) {
      delete memoryStore[key];
      try {
        window.localStorage?.removeItem(key);
      } catch {}
    }
  };
  let currentLang = languageByCode[storage.get("cm_lang")] ? storage.get("cm_lang") : "en";
  let currentUser = null;
  let observer = null;

  function compact(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function getTranslation(original) {
    if (currentLang === "en") return "";
    return translations[currentLang]?.[original] || "";
  }

  function translateTextNode(node) {
    if (!node.nodeValue || !compact(node.nodeValue)) return;
    if (!node.__cmOriginalText) node.__cmOriginalText = node.nodeValue;
    const original = compact(node.__cmOriginalText);
    const translated = getTranslation(original);
    if (translated) {
      const leading = node.__cmOriginalText.match(/^\s*/)?.[0] || "";
      const trailing = node.__cmOriginalText.match(/\s*$/)?.[0] || "";
      node.nodeValue = `${leading}${translated}${trailing}`;
    } else {
      node.nodeValue = node.__cmOriginalText;
    }
  }

  function translateAttributes(element) {
    ["placeholder", "aria-label", "title", "alt"].forEach((attr) => {
      if (!element.hasAttribute?.(attr)) return;
      const dataName = `data-cm-original-${attr.replace(/[^a-z0-9]+/gi, "-")}`;
      if (!element.hasAttribute(dataName)) element.setAttribute(dataName, element.getAttribute(attr));
      const stored = element.getAttribute(dataName);
      const original = compact(stored);
      const translated = getTranslation(original);
      element.setAttribute(attr, translated || stored);
    });
  }

  function translateRoot(root = document.body) {
    if (!root) return;
    observer?.disconnect();
    const nodes = [];
    function collect(node) {
      if (!node || skipTags.has(node.tagName)) return;
      if (node.nodeType === 1 && node.matches?.("[data-no-translate], [data-no-translate] *")) return;
      if (node.nodeType === 3 && node.parentElement && !skipTags.has(node.parentElement.tagName)) {
        nodes.push(node);
        return;
      }
      node.childNodes?.forEach(collect);
    }
    collect(root);
    nodes.forEach(translateTextNode);
    updateLangButton();
    try {
      root.querySelectorAll?.("[placeholder], [aria-label], [title], img[alt]").forEach(translateAttributes);
    } catch {}
    setTimeout(updateLangButton, 0);
    startObserver();
  }

  function updateLangButton() {
    const currentLanguage = languageByCode[currentLang] || languageByCode.en;
    document.querySelectorAll("[data-lang-toggle]").forEach((button) => {
      const label = button.querySelector("[data-lang-current]");
      if (label) label.textContent = `${currentLanguage.flag} ${currentLanguage.label}`;
    });
    document.querySelectorAll("[data-lang-option]").forEach((button) => {
      const active = button.dataset.langOption === currentLang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-current", active ? "true" : "false");
    });
    document.documentElement.setAttribute("lang", currentLanguage.htmlLang);
    updateAccountButtons();
  }

  function updateAccountButtons() {
    document.querySelectorAll("[data-account-toggle]").forEach((button) => {
      if (currentUser) button.textContent = getTranslation("Account") || "Account";
      else button.textContent = getTranslation("Log in") || "Log in";
    });
  }

  function startObserver() {
    observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length)) translateRoot(document.body);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function addHeaderControls() {
    document.querySelectorAll(".nav-links").forEach((nav) => {
      if (nav.querySelector("[data-language-switcher]")) return;
      const languageSwitcher = document.createElement("div");
      languageSwitcher.className = "language-switcher";
      languageSwitcher.dataset.languageSwitcher = "true";
      languageSwitcher.dataset.noTranslate = "true";

      const langButton = document.createElement("button");
      langButton.className = "nav-utility";
      langButton.type = "button";
      langButton.dataset.langToggle = "true";
      langButton.dataset.noTranslate = "true";
      langButton.setAttribute("aria-haspopup", "true");
      langButton.setAttribute("aria-expanded", "false");
      langButton.innerHTML = `<span data-lang-current></span><span aria-hidden="true">⌄</span>`;
      langButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = languageSwitcher.classList.toggle("is-open");
        langButton.setAttribute("aria-expanded", String(isOpen));
        languageMenu.hidden = !isOpen;
      });

      const languageMenu = document.createElement("div");
      languageMenu.className = "language-menu";
      languageMenu.dataset.langMenu = "true";
      languageMenu.hidden = true;
      languageMenu.setAttribute("role", "menu");
      languageMenu.innerHTML = languages.map((language) => `
        <button class="language-option" type="button" role="menuitem" data-lang-option="${language.code}">
          <span aria-hidden="true">${language.flag}</span>
          <span>${language.label}</span>
        </button>
      `).join("");
      languageMenu.addEventListener("click", (event) => {
        event.stopPropagation();
        const option = event.target.closest("[data-lang-option]");
        if (!option) return;
        currentLang = option.dataset.langOption;
        storage.set("cm_lang", currentLang);
        languageSwitcher.classList.remove("is-open");
        langButton.setAttribute("aria-expanded", "false");
        languageMenu.hidden = true;
        translateRoot(document.body);
      });
      languageSwitcher.append(langButton, languageMenu);

      const accountButton = document.createElement("button");
      accountButton.className = "nav-utility";
      accountButton.type = "button";
      accountButton.dataset.accountToggle = "true";
      accountButton.dataset.noTranslate = "true";
      accountButton.textContent = "Log in";
      accountButton.addEventListener("click", openAuthModal);

      nav.append(languageSwitcher, accountButton);
    });
  }

  function bindCopyButtons() {
    document.querySelectorAll("[data-copy-value]").forEach((button) => {
      if (button.dataset.copyBound) return;
      button.dataset.copyBound = "true";
      button.addEventListener("click", async () => {
        const value = button.dataset.copyValue || "";
        const originalText = button.textContent;
        const fallbackCopy = () => {
          const textarea = document.createElement("textarea");
          textarea.value = value;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "fixed";
          textarea.style.top = "0";
          textarea.style.left = "-9999px";
          document.body.append(textarea);
          textarea.focus();
          textarea.select();
          const copied = document.execCommand("copy");
          textarea.remove();
          return copied;
        };
        try {
          let copied = false;
          if (navigator.clipboard?.writeText) {
            try {
              await navigator.clipboard.writeText(value);
              copied = true;
            } catch {
              copied = fallbackCopy();
            }
          } else {
            copied = fallbackCopy();
          }
          if (!copied) return;
          button.textContent = getTranslation("Copied") || "Copied";
          button.classList.add("is-copied");
          window.setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove("is-copied");
          }, 1600);
        } catch {
          button.textContent = originalText;
        }
      });
    });
  }

  function setAuthStatus(user) {
    currentUser = user || null;
    updateAccountButtons();
    const modalUser = document.querySelector("[data-auth-user]");
    if (modalUser) modalUser.textContent = currentUser ? currentUser.email : "";
  }

  function authModalHtml() {
    return `
      <div class="auth-modal" data-auth-modal hidden>
        <div class="auth-backdrop" data-auth-close></div>
        <section class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <button class="auth-close" type="button" data-auth-close aria-label="Close">×</button>
          <p class="eyebrow">ChinaMigo Account</p>
          <h2 id="auth-title">Log in with email</h2>
          <p class="auth-intro">Save your contact details and return to your China planning conversation.</p>
          <p class="auth-user" data-auth-user></p>
          <form data-auth-form>
            <label>
              Name
              <input name="name" autocomplete="name" />
            </label>
            <label>
              Email
              <input name="email" autocomplete="email" type="email" required />
            </label>
            <label>
              Password
              <input name="password" autocomplete="current-password" type="password" minlength="8" required />
            </label>
            <div class="auth-actions">
              <button class="pill-button dark" type="submit" data-auth-submit>Log in</button>
              <button class="text-link" type="button" data-auth-mode>Create account</button>
            </div>
          </form>
          <button class="auth-logout" type="button" data-auth-logout hidden>Logout</button>
          <p class="auth-status" data-auth-status aria-live="polite"></p>
        </section>
      </div>
    `;
  }

  function ensureAuthModal() {
    if (!document.querySelector("[data-auth-modal]")) {
      document.body.insertAdjacentHTML("beforeend", authModalHtml());
      bindAuthModal();
    }
  }

  function openAuthModal() {
    ensureAuthModal();
    const modal = document.querySelector("[data-auth-modal]");
    modal.hidden = false;
    modal.classList.add("is-open");
    renderAuthMode(false);
    modal.querySelector("input[name='email']")?.focus();
  }

  function closeAuthModal() {
    const modal = document.querySelector("[data-auth-modal]");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.hidden = true;
  }

  function renderAuthMode(registerMode) {
    const modal = document.querySelector("[data-auth-modal]");
    if (!modal) return;
    modal.dataset.mode = registerMode ? "register" : "login";
    modal.querySelector("#auth-title").textContent = currentUser ? "Your account" : registerMode ? "Create an account" : "Log in with email";
    modal.querySelector("[data-auth-submit]").textContent = registerMode ? "Create account" : "Log in";
    modal.querySelector("[data-auth-mode]").textContent = registerMode ? "Already have an account?" : "Create account";
    modal.querySelector("input[name='name']").closest("label").hidden = !registerMode;
    modal.querySelector("form").hidden = Boolean(currentUser);
    modal.querySelector("[data-auth-logout]").hidden = !currentUser;
    modal.querySelector("[data-auth-status]").textContent = "";
    translateRoot(modal);
  }

  function bindAuthModal() {
    document.querySelectorAll("[data-auth-close]").forEach((button) => button.addEventListener("click", closeAuthModal));
    document.querySelector("[data-auth-mode]")?.addEventListener("click", () => {
      const modal = document.querySelector("[data-auth-modal]");
      renderAuthMode(modal?.dataset.mode !== "register");
    });
    document.querySelector("[data-auth-logout]")?.addEventListener("click", async () => {
      if (isStaticPreview) storage.remove("cm_static_user");
      else await fetch("/api/visitor/logout", { method: "POST" });
      setAuthStatus(null);
      renderAuthMode(false);
    });
    document.querySelector("[data-auth-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const modal = document.querySelector("[data-auth-modal]");
      const status = modal.querySelector("[data-auth-status]");
      const submit = modal.querySelector("[data-auth-submit]");
      const registerMode = modal.dataset.mode === "register";
      status.textContent = registerMode ? "Creating account..." : "Logging in...";
      submit.disabled = true;
      try {
        if (isStaticPreview) {
          const formData = Object.fromEntries(new FormData(event.currentTarget));
          const user = {
            name: formData.name || "",
            email: formData.email || ""
          };
          storage.set("cm_static_user", JSON.stringify(user));
          setAuthStatus(user);
          status.textContent = registerMode ? "Account saved for this preview." : "Logged in for this preview.";
          renderAuthMode(false);
          return;
        }
        const response = await fetch(registerMode ? "/api/visitor/register" : "/api/visitor/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to continue.");
        setAuthStatus(result.user);
        status.textContent = registerMode ? "Account created." : "Logged in.";
        renderAuthMode(false);
      } catch (error) {
        status.textContent = error.message || "Unable to continue.";
      } finally {
        submit.disabled = false;
      }
    });
  }

  async function loadVisitorSession() {
    if (isStaticPreview) {
      try {
        const savedUser = JSON.parse(storage.get("cm_static_user") || "null");
        setAuthStatus(savedUser);
      } catch {
        setAuthStatus(null);
      }
      return;
    }
    try {
      const response = await fetch("/api/visitor/session");
      const result = await response.json();
      setAuthStatus(result.authenticated ? result.user : null);
    } catch {
      setAuthStatus(null);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    addHeaderControls();
    bindCopyButtons();
    ensureAuthModal();
    loadVisitorSession();
    translateRoot(document.body);
  });
})();
