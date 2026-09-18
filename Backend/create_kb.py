import os
import json

base_dir = r"c:\Users\Rushikesh Tonpe\Dropbox\PC\Downloads\Infosys-Project-Moodmentor-main\Infosys-Project-Moodmentor-main\Backend\knowledge_base"
os.makedirs(base_dir, exist_ok=True)

docs = [
    # Stress management
    {
        "id": "workplace-stress-management",
        "title": "Managing Stress in the Workplace",
        "source_url": "https://www.apa.org/topics/healthy-workplaces/work-stress",
        "source_name": "American Psychological Association",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "stress_management",
        "content": "Workplace stress is common, but chronic stress can negatively impact physical and emotional health. To manage workplace stress effectively, start by tracking your stressors. Keep a journal for a week or two to identify which situations create the most stress and how you respond to them. Develop healthy responses instead of attempting to fight stress with unhealthy habits. Exercise is a great stress-buster, as are hobbies and favorite activities. Establish boundaries by not checking work emails from home in the evening or answering work phone calls during dinner. Take time to recharge to avoid burnout; this requires disconnecting from work during time off. Finally, learn how to relax through techniques like meditation, deep breathing, or mindfulness. Talk to your supervisor about your stressors and try to come up with solutions together, such as clarifying expectations or getting necessary resources."
    },
    {
        "id": "progressive-muscle-relaxation",
        "title": "Progressive Muscle Relaxation (PMR)",
        "source_url": "https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/relaxation-technique/art-20045368",
        "source_name": "Mayo Clinic",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "stress_management",
        "content": "Progressive muscle relaxation is a technique that involves tensing and then relaxing different muscle groups in the body. This helps you release physical tension and reduces stress and anxiety. To practice PMR, find a quiet place to sit or lie down. Close your eyes and take a few deep breaths. Starting with your toes, tense the muscles as tightly as you can for 5-10 seconds, then completely relax them for 30 seconds. Pay attention to the feeling of relaxation in your toes. Move up your body, repeating this process for your calves, thighs, abdomen, chest, arms, hands, neck, and face. Focus on the contrast between the tension and the relaxation. Regular practice can help you become more aware of physical tension in your body and allow you to release it more easily during stressful situations."
    },
    {
        "id": "coping-with-acute-stress",
        "title": "Coping Techniques for Acute Stress",
        "source_url": "https://www.nimh.nih.gov/health/publications/stress",
        "source_name": "National Institute of Mental Health",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "stress_management",
        "content": "Acute stress occurs in response to an immediate perceived threat or challenge. To cope with acute stress, focus on regulating your nervous system. Deep breathing is highly effective; try taking a slow, deep breath in through your nose, holding it for a moment, and exhaling slowly through your mouth. Grounding techniques, like the 5-4-3-2-1 method (identifying 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste), can quickly bring you back to the present moment. Physical movement, even just a brief walk or stretching, can help dissipate stress hormones. Avoid making major decisions when experiencing acute stress. If possible, step away from the stressful situation temporarily. Remember that the acute stress response is temporary and will pass. Talk to someone you trust if you need immediate support."
    },
    # Mindfulness & meditation
    {
        "id": "mindfulness-meditation-basics",
        "title": "Introduction to Mindfulness Meditation",
        "source_url": "https://www.mayoclinic.org/healthy-lifestyle/consumer-health/in-depth/mindfulness-exercises/art-20046356",
        "source_name": "Mayo Clinic",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "mindfulness",
        "content": "Mindfulness is a type of meditation where you focus on being intensely aware of what you're sensing and feeling in the moment, without interpretation or judgment. Practicing mindfulness involves breathing methods, guided imagery, and other practices to relax the body and mind. To get started, find a quiet place to sit comfortably. Focus on your breathing, observing each inhale and exhale. When your mind wanders (which it will), gently bring your focus back to your breath without judging yourself for the distraction. You can practice mindfulness informally throughout the day by bringing your full attention to routine activities, like eating or walking. Regular mindfulness practice can help reduce stress, improve attention, and increase self-awareness."
    },
    {
        "id": "body-scan-meditation",
        "title": "Body Scan Meditation Guide",
        "source_url": "https://www.nccih.nih.gov/health/meditation-and-mindfulness-what-you-need-to-know",
        "source_name": "National Center for Complementary and Integrative Health",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "mindfulness",
        "content": "A body scan is a mindfulness meditation practice that promotes physical and mental relaxation. It involves systematically focusing your attention on different parts of your body. Lie down on your back in a comfortable position. Close your eyes and take a few deep breaths. Bring your awareness to your toes, noticing any sensations (warmth, coolness, tingling, or tension) without trying to change them. Slowly move your attention up through your feet, ankles, calves, knees, and thighs. Continue scanning upwards through your pelvis, abdomen, chest, back, arms, hands, neck, and face. If you notice tension, imagine breathing into that area and releasing the tension as you exhale. A body scan can help you reconnect with your physical body, reduce stress, and improve sleep."
    },
    {
        "id": "mindful-walking",
        "title": "Practicing Mindful Walking",
        "source_url": "https://www.nhs.uk/mental-health/self-help/tips-and-support/mindfulness/",
        "source_name": "National Health Service (NHS)",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "mindfulness",
        "content": "Mindful walking is an active form of meditation that brings your awareness to the physical experience of walking. It's a great way to incorporate mindfulness into a busy day. Find a quiet place where you can walk back and forth for 10-15 paces, or simply practice while walking outdoors. Stand still for a moment, feeling the ground beneath your feet. As you begin to walk, focus your attention on the physical sensations of each step: the lifting of your foot, the movement of your leg, and the placement of your foot on the ground. Coordinate your breathing with your steps if it feels natural. If your mind wanders to other thoughts or worries, simply acknowledge them and gently bring your focus back to the sensation of walking. Mindful walking can reduce stress, improve concentration, and connect you with your environment."
    },
    # Sleep hygiene
    {
        "id": "improving-sleep-hygiene",
        "title": "Essential Sleep Hygiene Habits",
        "source_url": "https://www.cdc.gov/sleep/about_sleep/sleep_hygiene.html",
        "source_name": "Centers for Disease Control and Prevention",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "sleep",
        "content": "Good sleep hygiene consists of habits that help you get a good night's sleep. Consistency is key: go to bed at the same time each night and get up at the same time each morning, including on the weekends. Make sure your bedroom is quiet, dark, relaxing, and at a comfortable temperature. Remove electronic devices, such as TVs, computers, and smart phones, from the bedroom. Avoid large meals, caffeine, and alcohol before bedtime. Get some exercise; being physically active during the day can help you fall asleep more easily at night. If you can't fall asleep within 20 minutes of going to bed, get up and do a quiet, relaxing activity until you feel sleepy. Good sleep hygiene improves sleep quality, which is essential for physical and mental health."
    },
    {
        "id": "evening-wind-down-routine",
        "title": "Creating an Effective Wind-Down Routine",
        "source_url": "https://www.nhlbi.nih.gov/health/sleep-deprivation/health-topics",
        "source_name": "National Heart, Lung, and Blood Institute",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "sleep",
        "content": "A wind-down routine is a set of activities you do in the hour before bed to prepare your mind and body for sleep. It signals to your brain that it's time to transition from the activity of the day to rest. Start by dimming the lights to encourage the production of melatonin, a sleep-promoting hormone. Disconnect from screens (phones, tablets, computers, TV) at least 30 minutes before bed, as the blue light can interfere with sleep. Engage in relaxing activities such as reading a physical book, listening to calming music, taking a warm bath, or doing gentle stretches. Practice relaxation techniques like deep breathing or meditation. Avoid stimulating activities or discussing stressful topics. A consistent wind-down routine can significantly improve how quickly you fall asleep and the quality of your rest."
    },
    {
        "id": "optimizing-bedroom-environment",
        "title": "Optimizing Your Bedroom for Sleep",
        "source_url": "https://www.sleepfoundation.org/bedroom-environment",
        "source_name": "Sleep Foundation",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "sleep",
        "content": "Your bedroom environment plays a crucial role in the quality of your sleep. To optimize it, focus on keeping the room cool, dark, and quiet. The ideal temperature for sleep is generally between 60 to 67 degrees Fahrenheit (15.6 to 19.4 degrees Celsius). Use blackout curtains or an eye mask to block out light, which can disrupt your circadian rhythm. Minimize noise by using earplugs or a white noise machine to mask disruptive sounds. Ensure your mattress and pillows are comfortable and supportive. Reserve your bed primarily for sleep and intimacy, avoiding working or watching TV in bed, so your brain associates the space with rest. A calming, clutter-free bedroom environment can significantly enhance your ability to fall asleep and stay asleep throughout the night."
    },
    # Exercise & movement
    {
        "id": "benefits-of-daily-walking",
        "title": "The Physical and Mental Benefits of Walking",
        "source_url": "https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/walking/art-20046261",
        "source_name": "Mayo Clinic",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "exercise",
        "content": "Walking is a simple, accessible form of exercise with profound physical and mental health benefits. Regular brisk walking can help you maintain a healthy weight, prevent or manage various conditions (including heart disease, stroke, and high blood pressure), strengthen your bones and muscles, and improve cardiovascular fitness. Beyond physical health, walking is excellent for mental well-being. It can improve your mood, cognition, memory, and sleep. Walking outdoors in nature, often called 'green exercise,' has been shown to be particularly effective at reducing stress and anxiety. Aim for at least 30 minutes of brisk walking most days of the week. If you can't do 30 minutes at once, break it up into shorter sessions. The key is consistency and finding a pace that elevates your heart rate while still allowing you to hold a conversation."
    },
    {
        "id": "desk-stretches-for-office-workers",
        "title": "Essential Desk Stretches",
        "source_url": "https://www.nhs.uk/live-well/exercise/sitting-exercises/",
        "source_name": "National Health Service (NHS)",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "exercise",
        "content": "Sitting at a desk for prolonged periods can lead to stiffness, muscle tension, and poor posture. Incorporating simple stretches into your workday can alleviate these issues. Try neck stretches: gently tilt your ear towards your shoulder and hold for 15 seconds on each side. For your shoulders, roll them backwards and forwards in smooth circles. To relieve tension in your upper back and chest, interlace your fingers behind your back and gently lift your arms while pushing your chest forward. Stretch your wrists and forearms by extending your arm straight out in front of you and gently pulling your fingers back towards your body. Finally, do a simple seated spinal twist by sitting tall, placing your right hand on your left knee, and gently twisting to look over your left shoulder, then repeat on the other side. Aim to do these stretches every hour to maintain flexibility and reduce discomfort."
    },
    {
        "id": "incorporating-movement-breaks",
        "title": "The Importance of Movement Breaks",
        "source_url": "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
        "source_name": "World Health Organization",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "exercise",
        "content": "Sedentary behavior, such as sitting for long hours, is associated with increased risks of health problems, even if you exercise regularly. Taking frequent, short movement breaks throughout the day is crucial for mitigating these risks. Aim to stand up, stretch, or walk around for 1-2 minutes every 30-60 minutes. These micro-breaks increase blood flow, boost energy levels, and reduce muscle fatigue. You can incorporate movement into your routine by standing up during phone calls, taking a short walk to get water, or using a standing desk for part of the day. Setting a timer or using an app can remind you to move. These brief interruptions to prolonged sitting help maintain metabolic health, improve focus, and prevent the stiffness and discomfort associated with a sedentary lifestyle."
    },
    # Social connection
    {
        "id": "importance-of-social-connection",
        "title": "The Health Benefits of Social Connection",
        "source_url": "https://www.cdc.gov/emotional-wellbeing/social-connectedness/index.htm",
        "source_name": "Centers for Disease Control and Prevention",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "social",
        "content": "Strong social connections are essential for both physical and mental well-being. People who have supportive relationships and feel connected to others tend to live longer, have better immune function, and experience lower rates of anxiety and depression. Social connection doesn't necessarily mean having a large network of friends; the quality of the relationships is more important than the quantity. Having even one or two close confidants can provide significant health benefits. To foster social connection, prioritize spending quality time with loved ones, actively listen when others speak, and show genuine interest in their lives. Volunteering or joining clubs and groups based on shared interests can also help you build new connections and a sense of community. Strong social bonds provide emotional support during difficult times and contribute to a sense of belonging and purpose."
    },
    {
        "id": "coping-with-loneliness",
        "title": "Strategies for Coping with Loneliness",
        "source_url": "https://www.apa.org/topics/social-connection/loneliness",
        "source_name": "American Psychological Association",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "social",
        "content": "Loneliness is a common experience, but chronic loneliness can impact mental and physical health. If you're feeling lonely, it's important to acknowledge your feelings without judgment. Start by taking small steps to connect with others. Reach out to an old friend or family member for a brief phone call or coffee date. Engage in activities you enjoy in a social setting, such as taking a class, joining a book club, or volunteering for a cause you care about. When interacting with others, try to be present and show genuine interest. Limit time on social media if it makes you feel more isolated, as curated feeds can sometimes exacerbate feelings of loneliness. Consider seeking professional support, such as therapy, if loneliness is persistent and significantly affecting your quality of life."
    },
    {
        "id": "meaningful-conversation-starters",
        "title": "Fostering Connection Through Conversation",
        "source_url": "https://www.mhanational.org/staying-connected",
        "source_name": "Mental Health America",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "social",
        "content": "Meaningful conversations are a key way to build and deepen social connections. To move beyond small talk, try asking open-ended questions that encourage the other person to share their thoughts and experiences. Instead of 'How are you?', you might ask, 'What has been the highlight of your week?' or 'What are you looking forward to right now?' Active listening is crucial: give the person your full attention, make eye contact, and avoid interrupting. Reflect back what you hear to show understanding. Sharing something genuine about yourself can also encourage mutual vulnerability and deeper connection. Remember that the goal is not to agree on everything, but to understand and appreciate the other person's perspective. Fostering these types of interactions can reduce feelings of isolation and build stronger, more supportive relationships."
    },
    # Breathing techniques
    {
        "id": "4-7-8-breathing-technique",
        "title": "The 4-7-8 Breathing Method for Relaxation",
        "source_url": "https://www.medicalnewstoday.com/articles/324417",
        "source_name": "Medical News Today",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "breathing",
        "content": "The 4-7-8 breathing technique, developed by Dr. Andrew Weil, is a simple but powerful method for reducing stress and promoting sleep. It works by regulating the breath and shifting the nervous system from a state of arousal to a state of relaxation. To practice it, sit comfortably with a straight back. Exhale completely through your mouth, making a whoosh sound. Close your mouth and inhale quietly through your nose to a mental count of four. Hold your breath for a count of seven. Exhale completely through your mouth, making a whoosh sound to a count of eight. This completes one cycle. Repeat the cycle three more times for a total of four breaths. Practice this technique at least twice a day. It may feel slightly dizzying at first, but with practice, it becomes an effective tool for managing anxiety and falling asleep."
    },
    {
        "id": "box-breathing-method",
        "title": "Box Breathing: A Technique for Calm and Focus",
        "source_url": "https://my.clevelandclinic.org/health/articles/22212-box-breathing",
        "source_name": "Cleveland Clinic",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "breathing",
        "content": "Box breathing, also known as square breathing, is a powerful technique used by athletes, first responders, and the military to maintain calm and focus in high-stress situations. The technique involves four equal steps, visualizing the four sides of a box. To practice, sit comfortably and exhale completely. Step 1: Inhale slowly through your nose for a count of four. Step 2: Hold your breath in for a count of four. Step 3: Exhale slowly through your mouth for a count of four. Step 4: Hold your breath out (lungs empty) for a count of four. Repeat this cycle for 3 to 5 minutes. Box breathing helps regulate the autonomic nervous system, lowers heart rate, and clears the mind, making it an excellent practice before a stressful event or anytime you feel overwhelmed."
    },
    {
        "id": "diaphragmatic-breathing",
        "title": "Mastering Diaphragmatic (Belly) Breathing",
        "source_url": "https://www.health.harvard.edu/healthbeat/learning-diaphragmatic-breathing",
        "source_name": "Harvard Medical School",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "breathing",
        "content": "Diaphragmatic breathing, or belly breathing, encourages full oxygen exchange and slows the heartbeat, which can lower or stabilize blood pressure and reduce stress. When we are stressed, we often take shallow breaths from the chest. Diaphragmatic breathing engages the large muscle at the base of the lungs. To practice, lie on your back or sit comfortably. Place one hand on your upper chest and the other on your belly, just below your rib cage. Breathe in slowly through your nose, letting the air deeply into your lower belly. The hand on your chest should remain relatively still, while the hand on your belly should rise. Exhale slowly through pursed lips; the hand on your belly should lower. Practice this for 5-10 minutes, several times a day, to help train your body to breathe more efficiently and calmly."
    },
    # Gratitude practices
    {
        "id": "benefits-of-gratitude-journaling",
        "title": "Starting a Gratitude Journal",
        "source_url": "https://greatergood.berkeley.edu/article/item/tips_for_keeping_a_gratitude_journal",
        "source_name": "Greater Good Science Center",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "gratitude",
        "content": "Keeping a gratitude journal is a well-researched practice that can significantly improve psychological well-being and increase positive emotions. The goal is to consciously focus on the good things in your life. To start, choose a journal or an app. Set aside 5-10 minutes a few times a week (daily isn't always necessary and can lead to fatigue). Write down 3-5 things you are grateful for. Be specific: instead of 'my friends,' write 'the supportive conversation I had with Sarah today.' Focus on people and experiences rather than material items. Try to notice the unexpected or small details. Don't rush the process; take a moment to truly feel the emotion associated with each entry. Regular gratitude journaling trains your brain to notice the positive aspects of your life, building resilience against stress and negativity."
    },
    {
        "id": "three-good-things-exercise",
        "title": "The Three Good Things Exercise",
        "source_url": "https://ggia.berkeley.edu/practice/three-good-things",
        "source_name": "Greater Good Science Center",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "gratitude",
        "content": "The 'Three Good Things' exercise is a simple, effective intervention designed to increase happiness and decrease depressive symptoms. The practice involves writing down three positive events that happened each day and reflecting on why they occurred. Each evening before bed, write down three things that went well that day. They can be small (e.g., 'a coworker bought me coffee') or large (e.g., 'I received a promotion'). Next to each item, write a brief explanation of *why* it happened (e.g., 'because my coworker is thoughtful'). This reflection step is crucial as it helps you recognize your role or the supportive role of others in creating positive experiences. Doing this consistently for just one week can have lasting positive effects on your mood and outlook."
    },
    # Emotional regulation
    {
        "id": "naming-emotions",
        "title": "Name It to Tame It: Identifying Emotions",
        "source_url": "https://www.apa.org/monitor/2022/01/special-emotion-regulation",
        "source_name": "American Psychological Association",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "emotional_regulation",
        "content": "One of the first steps in emotional regulation is simply identifying and naming what you are feeling. The phrase 'name it to tame it,' coined by Dr. Dan Siegel, describes how putting feelings into words can decrease the intensity of the emotion. When we explicitly identify an emotion (e.g., 'I am feeling overwhelmed right now' or 'I am angry'), it activates the prefrontal cortex (the rational part of the brain) and calms down the amygdala (the emotional center). To practice, pause when you feel a strong emotion. Instead of reacting immediately or pushing the feeling away, ask yourself, 'What am I feeling right now?' Be as specific as possible—are you frustrated, disappointed, anxious, or sad? Acknowledging the emotion without judgment creates space between the feeling and your reaction, allowing you to choose a healthier response."
    },
    {
        "id": "cognitive-reframing-techniques",
        "title": "Cognitive Reframing for Emotional Regulation",
        "source_url": "https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/positive-thinking/art-20043950",
        "source_name": "Mayo Clinic",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "emotional_regulation",
        "content": "Cognitive reframing involves identifying and challenging negative or unhelpful thoughts and replacing them with more balanced, realistic ones. Our thoughts significantly influence our emotions; by changing how we perceive a situation, we can change how we feel about it. When you notice a strong negative emotion, identify the thought that triggered it. Is the thought accurate? Are you catastrophizing (expecting the worst) or personalizing (blaming yourself for things out of your control)? Try to find an alternative perspective. For example, instead of thinking, 'I made a mistake, I'm terrible at my job,' reframe it to, 'I made a mistake, but I can learn from this and improve.' Reframing isn't about forced positivity; it's about finding a more objective and helpful way to view challenging situations, which reduces emotional distress."
    },
    {
        "id": "grounding-techniques-for-anxiety",
        "title": "Grounding Techniques for High Anxiety",
        "source_url": "https://www.mhanational.org/grounding-techniques",
        "source_name": "Mental Health America",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "emotional_regulation",
        "content": "Grounding techniques are strategies that can help you manage intense emotions, anxiety, or traumatic flashbacks by pulling your focus away from distressing thoughts and back into the present moment. They work by engaging your senses. The 5-4-3-2-1 technique is a classic method: name 5 things you can see around you, 4 things you can physically feel, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. Other methods include running your hands under cold water, holding a piece of ice, pressing your feet firmly into the floor, or focusing intensely on the texture of an object in your hand. These techniques act as an 'anchor,' bringing your nervous system back to baseline and allowing you to regain control over your emotional state."
    },
    # Work-life balance
    {
        "id": "setting-work-boundaries",
        "title": "Setting Healthy Work Boundaries",
        "source_url": "https://hbr.org/2021/01/how-to-set-healthy-boundaries-at-work",
        "source_name": "Harvard Business Review",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "work_life_balance",
        "content": "Setting clear boundaries between work and personal life is essential for maintaining well-being and preventing burnout. Boundaries protect your time, energy, and mental health. Start by defining your working hours and sticking to them as much as possible. Communicate these hours to your colleagues and manager. Turn off work-related notifications on your phone outside of these hours. If you work from home, try to have a dedicated workspace; when you leave that space, you leave work behind. Learn to say 'no' to non-essential tasks or projects that compromise your personal time or exceed your capacity. If you must check emails after hours, designate a specific, brief window to do so, rather than being continuously available. Consistent boundaries help you fully engage at work and fully disconnect during your personal time."
    },
    {
        "id": "implementing-a-digital-detox",
        "title": "The Benefits of a Digital Detox",
        "source_url": "https://www.apa.org/news/press/releases/stress/2017/technology-social-media",
        "source_name": "American Psychological Association",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "work_life_balance",
        "content": "Constant connectivity to technology and social media can increase stress and blur the lines between work and leisure. A digital detox—a period of time during which you intentionally refrain from using electronic devices—can help restore balance. You don't have to abandon technology completely. Start small: designate 'tech-free' zones in your home, such as the bedroom or the dining table. Try putting your phone away for the first hour after waking up or the hour before bed. Consider taking a half-day or full-day break from social media and email on the weekends. Use this time to engage in offline activities you enjoy, connect face-to-face with loved ones, or simply rest. Regular digital detoxes can reduce anxiety, improve sleep, and increase your presence and focus in daily life."
    },
    {
        "id": "work-to-home-transition-rituals",
        "title": "Creating Transition Rituals",
        "source_url": "https://www.psychologytoday.com/us/blog/the-truisms-wellness/201509/the-importance-transition-time",
        "source_name": "Psychology Today",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "work_life_balance",
        "content": "Transition rituals are specific routines that signal to your brain that the workday has ended and personal time has begun. These are especially important for remote workers who don't have a physical commute. A good transition ritual helps you mentally 'clock out' and leave work stress behind. Your ritual could be changing out of work clothes, going for a short walk (a 'fake commute'), writing down tomorrow's to-do list so you don't carry those thoughts into the evening, or doing 5 minutes of stretching. The specific activity matters less than the consistency. By performing the same routine at the end of each workday, you train your mind to shift gears, allowing you to be more present and relaxed during your personal time."
    },
    # Burnout prevention
    {
        "id": "recognizing-burnout-signs",
        "title": "Recognizing the Early Signs of Burnout",
        "source_url": "https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases",
        "source_name": "World Health Organization",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "burnout",
        "content": "The World Health Organization recognizes burnout as an occupational phenomenon resulting from chronic workplace stress that has not been successfully managed. Recognizing the early signs is crucial for prevention. Burnout is characterized by three main dimensions: feelings of energy depletion or exhaustion, increased mental distance from one's job or feelings of negativism or cynicism related to one's job, and reduced professional efficacy. Early warning signs include chronic fatigue, insomnia, physical symptoms (like headaches or stomach issues), irritability with colleagues, a sense of dread about work, and a decline in productivity or quality of work. If you notice these signs, it's important to take them seriously and address the root causes of your stress before the burnout becomes severe."
    },
    {
        "id": "burnout-recovery-strategies",
        "title": "Strategies for Burnout Recovery",
        "source_url": "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/burnout/art-20046642",
        "source_name": "Mayo Clinic",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "burnout",
        "content": "Recovering from burnout requires intentional changes to reduce stress and replenish your energy. First, prioritize absolute rest. Ensure you are getting adequate sleep and taking actual time off work where you are fully disconnected. Re-evaluate your priorities and workload. Discuss your concerns with your supervisor and seek to adjust expectations, delegate tasks, or redefine your role if necessary. Focus on basic self-care: eat nutritious meals, engage in gentle exercise, and practice relaxation techniques like mindfulness. Seek support from friends, family, or colleagues. Consider professional help; a therapist can help you develop coping strategies and navigate the recovery process. Remember that burnout recovery takes time and patience; it's a process of gradually rebuilding your energy and finding a healthier approach to work."
    },
    {
        "id": "managing-workload-effectively",
        "title": "Effective Workload Management",
        "source_url": "https://hbr.org/2018/12/how-to-handle-a-heavy-workload",
        "source_name": "Harvard Business Review",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "burnout",
        "content": "An unmanageable workload is a primary driver of burnout. Effective workload management involves prioritizing tasks and communicating capacity. Start by categorizing tasks by urgency and importance (e.g., using the Eisenhower Matrix). Focus on high-impact tasks and see if low-impact tasks can be delegated, delayed, or dropped. Break large projects into smaller, manageable steps to avoid feeling overwhelmed. Be realistic about what you can accomplish in a day, taking into account meetings and administrative work. Crucially, learn to communicate your capacity. If asked to take on a new project when you are already full, you might say, 'I'd like to help, but given my current priorities, I wouldn't be able to start this until next week.' Proactively managing your workload helps maintain productivity while protecting your well-being."
    },
    # Nutrition & hydration
    {
        "id": "mood-and-food-connection",
        "title": "The Connection Between Mood and Food",
        "source_url": "https://www.health.harvard.edu/blog/nutritional-psychiatry-your-brain-on-food-201511168626",
        "source_name": "Harvard Medical School",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "nutrition",
        "content": "What you eat directly affects the structure and function of your brain and, ultimately, your mood. Your brain requires a constant supply of fuel from the foods you eat, and the 'premium' fuel comes from high-quality foods containing vitamins, minerals, and antioxidants that nourish the brain. Diets high in refined sugars and processed foods are harmful to the brain and can worsen symptoms of mood disorders, such as depression. A diet rich in vegetables, fruits, unprocessed grains, and lean proteins (like the Mediterranean diet) has been linked to a lower risk of depression. Additionally, about 95% of your serotonin (a neurotransmitter that regulates sleep, appetite, and mood) is produced in your gastrointestinal tract, which is highly influenced by the good bacteria in your gut microbiome. Eating a balanced, nutrient-rich diet supports both brain health and emotional well-being."
    },
    {
        "id": "importance-of-hydration",
        "title": "Hydration and Mental Performance",
        "source_url": "https://www.cdc.gov/healthyweight/healthy_eating/water-and-healthier-drinks.html",
        "source_name": "Centers for Disease Control and Prevention",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "nutrition",
        "content": "Staying adequately hydrated is crucial for maintaining optimal physical and cognitive function. Even mild dehydration can impair mood, concentration, and memory, and increase feelings of anxiety and fatigue. Water helps regulate body temperature, keeps joints lubricated, and delivers essential nutrients to cells. To maintain hydration, carry a water bottle with you and sip throughout the day. Don't wait until you feel thirsty, as thirst is a sign that you are already mildly dehydrated. While individual needs vary, a general guideline is to aim for about 8 glasses of water a day, adjusting for factors like physical activity and climate. You can also increase hydration by consuming water-rich foods like fruits and vegetables. Prioritizing hydration is a simple but highly effective way to support your overall wellness."
    },
    # General wellness
    {
        "id": "practicing-self-compassion",
        "title": "The Power of Self-Compassion",
        "source_url": "https://self-compassion.org/the-three-elements-of-self-compassion-2/",
        "source_name": "Dr. Kristin Neff (via self-compassion.org)",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "general_wellness",
        "content": "Self-compassion involves treating yourself with the same kindness, concern, and support you'd show to a good friend, especially when facing failure or personal inadequacy. It consists of three elements: self-kindness (being understanding rather than harshly critical), common humanity (recognizing that suffering and personal failures are part of the shared human experience), and mindfulness (observing negative emotions without over-identifying with them). When you make a mistake, instead of berating yourself, try to reframe your self-talk. Say, 'This is a moment of suffering, everyone struggles sometimes, may I be kind to myself.' Research shows that self-compassion leads to greater emotional resilience, lower levels of anxiety and depression, and more motivation to improve, compared to harsh self-criticism."
    },
    {
        "id": "building-emotional-resilience",
        "title": "Building Emotional Resilience",
        "source_url": "https://www.apa.org/topics/resilience/building-your-resilience",
        "source_name": "American Psychological Association",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "general_wellness",
        "content": "Resilience is the process of adapting well in the face of adversity, trauma, tragedy, or significant sources of stress. It involves 'bouncing back' from difficult experiences. Building resilience is like building a muscle; it takes time and intentionality. Key components include building strong, supportive relationships, fostering wellness (through adequate sleep, nutrition, and exercise), finding purpose (by helping others or engaging in meaningful activities), and embracing healthy thoughts. Try to maintain a hopeful outlook and accept that change is a part of life. When faced with a crisis, focus on the aspects you can control rather than the ones you can't. Developing a proactive approach to problem-solving and maintaining perspective during tough times can significantly enhance your ability to navigate life's challenges."
    },
    {
        "id": "power-of-daily-routines",
        "title": "The Stabilizing Power of Daily Routines",
        "source_url": "https://www.nm.org/healthbeat/healthy-tips/health-benefits-of-having-a-routine",
        "source_name": "Northwestern Medicine",
        "language": "en",
        "review_date": "2026-09-13",
        "category": "general_wellness",
        "content": "Establishing a daily routine can provide a sense of structure, predictability, and control, which is particularly beneficial for mental health. Routines reduce the number of decisions you have to make each day, conserving mental energy and reducing stress. A good routine anchors your day. Start with a consistent wake-up time and a morning ritual that sets a positive tone, such as reading, exercising, or enjoying a quiet cup of coffee. Incorporate regular times for meals, work, and physical activity. Just as important is an evening routine to help you wind down. While routines provide structure, it's also important to remain flexible; if your routine is disrupted, adapt without self-judgment. A healthy routine acts as a framework that supports your physical and emotional well-being."
    }
]

for doc in docs:
    file_path = os.path.join(base_dir, f"{doc['id']}.json")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(doc, f, indent=2)

readme_content = """# MoodMentor Wellness Knowledge Base

This directory contains the curated wellness knowledge base used by the MoodMentor RAG (Retrieval-Augmented Generation) pipeline to provide accurate, evidence-based guidance to users.

## Structure
The knowledge base consists of individual JSON files for each wellness topic.

Each file follows this schema:
```json
{
  "id": "unique-slug",
  "title": "Document Title",
  "source_url": "https://example.org/page",
  "source_name": "Organization Name",
  "language": "en",
  "review_date": "YYYY-MM-DD",
  "category": "category_name",
  "content": "The actual wellness guidance content..."
}
```

### Supported Categories
- `stress_management`
- `mindfulness`
- `sleep`
- `exercise`
- `social`
- `breathing`
- `gratitude`
- `emotional_regulation`
- `work_life_balance`
- `burnout`
- `nutrition`
- `general_wellness`

## Adding New Documents
1. Identify a credible source (e.g., WHO, NIH, APA, Mayo Clinic, NHS).
2. Summarize the guidance into 200-500 words of clear, actionable, and empathetic content in your own words.
3. Create a new JSON file named `{unique-slug}.json` following the schema above.
4. Ensure the `review_date` is current.
5. Commit the new file.

## Review Process
All knowledge base documents should be reviewed annually to ensure the guidance remains current with the latest medical and psychological consensus. Update the `review_date` field after reviewing.
"""

readme_path = os.path.join(base_dir, "README.md")
with open(readme_path, 'w', encoding='utf-8') as f:
    f.write(readme_content)

print(f"Created {len(docs)} JSON documents and README.md in {base_dir}")
