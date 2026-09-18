// ─── Supported Languages ───────────────────────────────────────────────────
export const LANGUAGES = [
  { id: 'en', code: 'en-IN', name: 'English', native: 'English', icon: '🇬🇧' },
  { id: 'hi', code: 'hi-IN', name: 'Hindi', native: 'हिन्दी', icon: '🇮🇳' },
  { id: 'mr', code: 'mr-IN', name: 'Marathi', native: 'मराठी', icon: '🇮🇳' },
  { id: 'ta', code: 'ta-IN', name: 'Tamil', native: 'தமிழ்', icon: '🇮🇳' },
  { id: 'ml', code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം', icon: '🇮🇳' },
]

// ─── Localized Breath Guidance Labels ──────────────────────────────────────
export const BREATH_LABELS = {
  en: { inhale: 'BREATHE IN', hold: 'HOLD', exhale: 'BREATHE OUT', sec: 'seconds', remaining: 'remaining', hint: '🌿 Close your eyes and follow the breath' },
  hi: { inhale: 'सांस अंदर लें', hold: 'रोकें', exhale: 'सांस छोड़ें', sec: 'सेकंड', remaining: 'शेष समय', hint: '🌿 अपनी आँखें बंद करें और सांस पर ध्यान दें' },
  mr: { inhale: 'श्वास आत घ्या', hold: 'थांबा', exhale: 'श्वास सोडा', sec: 'सेकंद', remaining: 'उरलेला वेळ', hint: '🌿 डोळे बंद करा आणि श्वासावर लक्ष केंद्रित करा' },
  ta: { inhale: 'மூச்சை உள்ளிழுக்கவும்', hold: 'நிறுத்தவும்', exhale: 'மூச்சை வெளிவிடவும்', sec: 'விநாடிகள்', remaining: 'மீதமுள்ள நேரம்', hint: '🌿 கண்களை மூடி சுவாசத்தை கவனியுங்கள்' },
  ml: { inhale: 'ശ്വാസം ഉള്ളിലേക്ക്', hold: 'പിടിക്കുക', exhale: 'ശ്വാസം പുറത്തേക്ക്', sec: 'സെക്കൻഡ്', remaining: 'ബാക്കി സമയം', hint: '🌿 കണ്ണുകൾ അടച്ച് ശ്വാസത്തിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുക' },
}

// ─── Multi-Language Meditation Programs ───────────────────────────────────
export const PROGRAMS = [
  {
    id: 'stress_relief', title: 'Work Stress Relief', category: 'Stress', icon: '🌿',
    color: '#10b981', duration: 180, difficulty: 'Beginner', defaultAmbient: 'rain',
    moodMatch: ['anger', 'disgust'],
    description: 'Release workday pressure, tight shoulders, and mental overload in just 3 minutes.',
    whyGeneric: 'A short guided breathing session designed for moments when your mind feels busy.',
    phases: [
      {
        start: 0, end: 30, breath: { inhale: 4, hold: 2, exhale: 4 },
        instruction: {
          en: 'Find a comfortable position and let your shoulders relax.',
          hi: 'एक आरामदायक स्थिति में बैठें और अपने कंधों को ढीला छोड़ें।',
          mr: 'एका आरामदायक स्थितीत बसा आणि आपले खांदे सैल सोडा.',
          ta: 'ஒரு வசதியான நிலையில் அமர்ந்து உங்கள் தோள்களை தளர்த்தவும்.',
          ml: 'ഒരു സുഖപ്രദമായ നിലയിൽ ഇരിക്കുക, തോളുകൾ അയച്ചുവിടുക.',
        },
        voice: {
          en: 'Find a comfortable position. Let your shoulders drop.',
          hi: 'एक आरामदायक स्थिति में बैठें। अपने कंधों को ढीला छोड़ें।',
          mr: 'एका आरामदायक स्थितीत बसा. आपले खांदे सैल सोडा.',
          ta: 'ஒரு வசதியான நிலையில் அமருங்கள். உங்கள் தோள்களை தளர்த்தவும்.',
          ml: 'ഒരു സുഖപ്രദമായ നിലയിൽ ഇരിക്കുക. നിങ്ങളുടെ തോളുകൾ അയക്കുക.',
        }
      },
      {
        start: 30, end: 60, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Take a slow breath in through your nose, then let it go with a sigh.',
          hi: 'नाक से धीरे-धीरे गहरी सांस लें, और धीरे से छोड़ें।',
          mr: 'नाकाने हळूच दीर्घ श्वास घ्या आणि शांतपणे सोडा.',
          ta: 'மூக்கு வழியாக மெதுவாக மூச்சை உள்ளிழுத்து, மெதுவாக வெளிவிடுங்கள்.',
          ml: 'മൂക്കിലൂടെ പതുക്കെ ശ്വാസമെടുക്കുക, ശേഷം സാവധാനം പുറത്തുവിടുക.',
        },
        voice: {
          en: 'Take a slow breath in. Now gently breathe out with a sigh.',
          hi: 'धीरे-धीरे गहरी सांस अंदर लें। अब शांति से बाहर छोड़ें।',
          mr: 'हळूच दीर्घ श्वास आत घ्या. आता शांतपणे बाहेर सोडा.',
          ta: 'மெதுவாக மூச்சை உள்ளிழுக்கவும். இப்போது மெதுவாக வெளிவிடவும்.',
          ml: 'പതുക്കെ ശ്വാസം ഉള്ളിലേക്ക് എടുക്കുക. ഇപ്പോൾ സാവധാനം പുറത്തുവിടുക.',
        }
      },
      {
        start: 60, end: 100, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Whatever happened at work today, set it down for now. This moment is yours.',
          hi: 'आज जो भी हुआ उसे अभी के लिए छोड़ दें। यह समय सिर्फ आपका है।',
          mr: 'आज कामावर जे काही घडले ते विसरून जा. हा क्षण फक्त तुमचा आहे.',
          ta: 'இன்று நடந்த அனைத்தையும் மறந்துவிடுங்கள். இந்த தருணம் உங்களுக்கானது.',
          ml: 'ഇന്ന് സംഭവിച്ചതെല്ലാം ഇപ്പോൾ മാറ്റിവെക്കുക. ഈ നിമിഷം നിങ്ങൾക്കുള്ളതാണ്.',
        },
        voice: {
          en: 'Whatever happened today, set it down. This moment is yours.',
          hi: 'आज की सभी चिंताओं को छोड़ दें। यह पल सिर्फ आपका है।',
          mr: 'सर्व चिंता बाजूला ठेवा. हा क्षण फक्त तुमचा आहे.',
          ta: 'அனைத்து கவலைகளையும் ஒதுக்கி வையுங்கள். இந்த நேரம் உங்களுக்கானது.',
          ml: 'എല്ലാ ചിന്തകളും മാറ്റിവെക്കുക. ഈ സമയം നിങ്ങൾക്കുള്ളതാണ്.',
        }
      },
      {
        start: 100, end: 135, breath: { inhale: 4, hold: 3, exhale: 6 },
        instruction: {
          en: 'Notice where you are holding tension — your jaw, forehead, fists. Let them soften.',
          hi: 'ध्यान दें कि तनाव कहाँ है — माथा, जबड़ा या हाथ। उन्हें पूरी तरह ढीला छोड़ें।',
          mr: 'तणाव कुठे आहे ते पहा — कपाळ, जबडा किंवा हात. त्यांना सैल सोडा.',
          ta: 'உங்கள் முகம், தோள்கள் மற்றும் கைகளை முற்றிலும் தளர்த்தவும்.',
          ml: 'നിങ്ങളുടെ മുഖവും തോളുകളും അയച്ചു ശാന്തമാക്കുക.',
        },
        voice: {
          en: 'Notice where you hold tension. Let it soften.',
          hi: 'अपने शरीर के तनाव को महसूस करें और उसे ढीला छोड़ दें।',
          mr: 'शरीरातील तणाव ओळखा आणि तो सैल सोडा.',
          ta: 'உங்கள் உடலின் இறுக்கத்தை தளர்த்துங்கள்.',
          ml: 'ശരീരത്തിലെ പിരിമുറുക്കം അയച്ചുവിടുക.',
        }
      },
      {
        start: 135, end: 160, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'You don\'t need to solve anything right now. You are safe in this stillness.',
          hi: 'इस समय कुछ भी सुलझाने की जरूरत नहीं है। आप पूरी तरह शांत और सुरक्षित हैं।',
          mr: 'सध्या काहीही सोडवण्याची गरज नाही. तुम्ही शांत आणि सुरक्षित आहात.',
          ta: 'இப்போது எதையும் தீர்க்க தேவையில்லை. நீங்கள் அமைதியாக இருக்கிறீர்கள்.',
          ml: 'ഇപ്പോൾ ഒന്നും പരിഹരിക്കേണ്ടതില്ല. നിങ്ങൾ തികച്ചും ശാന്തനാണ്.',
        },
        voice: {
          en: 'You don\'t need to solve anything right now. You are safe.',
          hi: 'अभी किसी बात की चिंता न करें। आप सुरक्षित हैं।',
          mr: 'आता कसलीही काळजी करू नका. तुम्ही सुरक्षित आहात.',
          ta: 'இப்போது கவலைப்பட வேண்டாம். நீங்கள் அமைதியாக இருங்கள்.',
          ml: 'ഇപ്പോൾ വിഷമിക്കേണ്ടതില്ല. നിങ്ങൾ സുരക്ഷിതനാണ്.',
        }
      },
      {
        start: 160, end: 180, breath: { inhale: 5, hold: 3, exhale: 7 },
        instruction: {
          en: 'Take one last nourishing breath, bringing renewed calm back to your day.',
          hi: 'एक अंतिम गहरी सांस लें, और अपने दिन में नई शांति का अनुभव करें।',
          mr: 'एक शेवटचा दीर्घ श्वास घ्या आणि नवीन ऊर्जा अनुभवा.',
          ta: 'கடைசியாக ஒரு முறை ஆழமாக சுவாசித்து புத்துணர்ச்சி பெறுங்கள்.',
          ml: 'അവസാനമായി ഒരു ദീർഘശ്വാസം എടുത്ത് പുതിയ ഉണർവ് നേടുക.',
        },
        voice: {
          en: 'Take one last deep breath. Bring calm back to your day.',
          hi: 'एक अंतिम गहरी सांस लें। अपने दिन में शांति लाएं।',
          mr: 'एक शेवटचा दीर्घ श्वास घ्या. दिवसात शांतता आणा.',
          ta: 'ஆழமாக சுவாசித்து உங்கள் நாளை அமைதியுடன் தொடருங்கள்.',
          ml: 'ദീർഘശ്വാസം എടുത്ത് മനസ്സമാധാനത്തോടെ മുന്നോട്ട് പോവുക.',
        }
      },
    ]
  },
  {
    id: 'deep_relax', title: 'Deep Relaxation', category: 'Relaxation', icon: '💜',
    color: '#8b5cf6', duration: 300, difficulty: 'Beginner', defaultAmbient: 'singing_bowl',
    moodMatch: ['sadness'],
    description: 'Progressive body awareness to dissolve physical tightness and emotional weight.',
    whyGeneric: 'When your body feels heavy, this gentle scan can help release what you are carrying.',
    phases: [
      {
        start: 0, end: 35, breath: { inhale: 4, hold: 2, exhale: 5 },
        instruction: {
          en: 'Close your eyes. Bring gentle attention to the crown of your head.',
          hi: 'आंखें बंद करें। अपना ध्यान अपने सिर के ऊपरी हिस्से पर लाएं।',
          mr: 'डोळे मिटा. आपले लक्ष डोक्याच्या वरच्या भागावर आणा.',
          ta: 'கண்களை மூடுங்கள். உங்கள் கவனத்தை தலையின் உச்சிக்கு கொண்டு வாருங்கள்.',
          ml: 'കണ്ണുകൾ അടയ്ക്കുക. ശ്രദ്ധ തലയുടെ മുകൾഭാഗത്തേക്ക് കൊണ്ടുവരിക.',
        },
        voice: {
          en: 'Close your eyes. Bring gentle attention to the top of your head.',
          hi: 'आंखें बंद करें। अपना ध्यान सिर के ऊपर केंद्रित करें।',
          mr: 'डोळे मिटा. आपले लक्ष डोक्यावर केंद्रित करा.',
          ta: 'கண்களை மூடி தலையின் உச்சியில் கவனம் செலுத்துங்கள்.',
          ml: 'കണ്ണുകൾ അടച്ച് തലയുടെ മുകളിൽ ശ്രദ്ധിക്കുക.',
        }
      },
      {
        start: 35, end: 75, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Soften the muscles around your eyes, cheeks, and jaw. Let your face relax completely.',
          hi: 'आंखों, गालों और जबड़े की मांसपेशियों को पूरी तरह ढीला छोड़ें।',
          mr: 'डोळे, गाल आणि जबड्याचे स्नायू पूर्णपणे सैल सोडा.',
          ta: 'உங்கள் கண்கள், கன்னங்கள் மற்றும் தாடையை தளர்த்தவும்.',
          ml: 'കണ്ണുകൾ, കവിളുകൾ, താടിയെല്ല് എന്നിവ അയച്ചുവിടുക.',
        },
        voice: {
          en: 'Soften your face. Let your jaw relax completely.',
          hi: 'चेहरे को ढीला छोड़ें। जबड़े को पूरी तरह शांत करें।',
          mr: 'चेहरा शांत ठेवा. जबडा सैल सोडा.',
          ta: 'முகத்தை தளர்த்தி அமைதியாக இருங்கள்.',
          ml: 'മുഖം ശാന്തമാക്കി താടിയെല്ല് അയക്കുക.',
        }
      },
      {
        start: 75, end: 120, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Move your awareness to your neck and shoulders. Imagine them melting downward.',
          hi: 'अपनी गर्दन और कंधों पर ध्यान दें। उन्हें नीचे की ओर ढीला छोड़ें।',
          mr: 'आपली मान आणि खांद्यांकडे लक्ष द्या. त्यांना सैल सोडा.',
          ta: 'கழுத்து மற்றும் தோள்களை தளர்த்தி ஓய்வெடுக்க விடுங்கள்.',
          ml: 'കഴുത്തും തോളുകളും അയച്ചു ശാന്തമാക്കുക.',
        },
        voice: {
          en: 'Move your awareness to your neck and shoulders. Let them melt.',
          hi: 'गर्दन और कंधों को पूरी तरह तनावमुक्त करें।',
          mr: 'मान आणि खांदे पूर्णपणे तणावमुक्त करा.',
          ta: 'கழுத்து மற்றும் தோள்பட்டையை தளர்த்தவும்.',
          ml: 'കഴുത്തും തോളും പൂർണ്ണമായി അയക്കുക.',
        }
      },
      {
        start: 120, end: 165, breath: { inhale: 5, hold: 3, exhale: 7 },
        instruction: {
          en: 'Feel your chest rise and fall. Breathe spaciousness into your heart.',
          hi: 'अपनी छाती के उठने और गिरने को महसूस करें। दिल में शांति भरें।',
          mr: 'छातीची हालचाल अनुभवा. मनात शांतता भरा.',
          ta: 'உங்கள் மார்பின் சுவாசத்தை உணருங்கள். இதயத்தில் அமைதியை நிரப்புங்கள்.',
          ml: 'നെഞ്ചിന്റെ ചലനം ശ്രദ്ധിക്കുക. ഹൃദയത്തിൽ സമാധാനം നിറയ്ക്കുക.',
        },
        voice: {
          en: 'Feel your chest rise and fall. Breathe into your heart.',
          hi: 'सांस की लय महसूस करें। हृदय में शांति लाएं।',
          mr: 'श्वासाची लय अनुभवा. मनात शांतता आणा.',
          ta: 'சுவாசத்தை உணர்ந்து அமைதி பெறுங்கள்.',
          ml: 'ശ്വാസം അനുഭവിച്ച് ശാന്തത കണ്ടെത്തുക.',
        }
      },
      {
        start: 165, end: 210, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Release any grip in your stomach and lower back. Let your breath be soft.',
          hi: 'पेट और पीठ के निचले हिस्से को ढीला छोड़ें। सांस को सहज रखें।',
          mr: 'पोट आणि पाठ सैल सोडा. श्वास सहज चालू द्या.',
          ta: 'வயிறு மற்றும் முதுகை தளர்த்தவும். சுவாசம் மென்மையாக இருக்கட்டும்.',
          ml: 'വയറും പുറംഭാഗവും അയക്കുക. ശ്വാസം സ്വാഭാവികമാക്കുക.',
        },
        voice: {
          en: 'Release any grip in your stomach. Let your breath be soft.',
          hi: 'पेट को पूरी तरह ढीला छोड़ें। सांस को कोमल बनाएं।',
          mr: 'पोट सैल सोडा. श्वास कोमल ठेवा.',
          ta: 'வயிற்றை தளர்த்தி மென்மையாக சுவாசிக்கவும்.',
          ml: 'വയറ് അയച്ച് മൃദുവായി ശ്വസിക്കുക.',
        }
      },
      {
        start: 210, end: 250, breath: { inhale: 4, hold: 2, exhale: 5 },
        instruction: {
          en: 'Notice your hands, arms, and fingers. Feel warmth resting there.',
          hi: 'अपने हाथों, बाहों और उंगलियों को महसूस करें। वहाँ गर्माहट का अहसास करें।',
          mr: 'आपले हात आणि बोटांकडे लक्ष द्या. तेथे ऊब अनुभवा.',
          ta: 'உங்கள் கைகளையும் விரல்களையும் உணருங்கள்.',
          ml: 'കൈകളും വിരലുകളും ശ്രദ്ധിക്കുക. അവിടെ ഊഷ്മളത അനുഭവിക്കുക.',
        },
        voice: {
          en: 'Notice your hands and arms. Feel the warmth resting there.',
          hi: 'हाथों और बाहों को महसूस करें।',
          mr: 'हात आणि बोटांमधील शांतता अनुभवा.',
          ta: 'கைகளில் உள்ள அமைதியை உணருங்கள்.',
          ml: 'കൈകളിലെ ശാന്തത അറിയുക.',
        }
      },
      {
        start: 250, end: 280, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Bring awareness down to your legs, knees, and feet resting on the floor.',
          hi: 'अपना ध्यान पैरों और पंजों पर लाएं जो जमीन को छू रहे हैं।',
          mr: 'लक्ष पाय आणि तळपायांवर आणा जे जमिनीला टेकलेले आहेत.',
          ta: 'கவனத்தை கால்கள் மற்றும் பாதங்களுக்கு கொண்டு வாருங்கள்.',
          ml: 'ശ്രദ്ധ കാലുകളിലേക്കും പാദങ്ങളിലേക്കും കൊണ്ടുവരിക.',
        },
        voice: {
          en: 'Bring awareness to your legs and feet.',
          hi: 'पैरों और पंजों को पूरी तरह तनावमुक्त करें।',
          mr: 'पाय पूर्णपणे शिथिल करा.',
          ta: 'கால்களை தளர்த்தி ஓய்வு கொடுங்கள்.',
          ml: 'കാലുകൾ അയച്ച് ശാന്തമാക്കുക.',
        }
      },
      {
        start: 280, end: 300, breath: { inhale: 5, hold: 4, exhale: 8 },
        instruction: {
          en: 'Your entire body is relaxed, rested, and at peace. Stay here a moment longer.',
          hi: 'आपका पूरा शरीर शांत और तनावमुक्त है। कुछ देर इस शांति में रहें।',
          mr: 'तुमचे संपूर्ण शरीर शांत आणि तणावमुक्त झाले आहे.',
          ta: 'உங்கள் முழு உடலும் அமைதியாகவும் தளர்வாகவும் உள்ளது.',
          ml: 'നിങ്ങളുടെ ശരീരം മുഴുവൻ ശാന്തവും വിശ്രാന്തവുമാണ്.',
        },
        voice: {
          en: 'Your entire body is relaxed and at peace.',
          hi: 'आपका संपूर्ण शरीर पूरी तरह शांत और विश्राम में है।',
          mr: 'तुमचे संपूर्ण शरीर शांत आणि आनंदी आहे.',
          ta: 'உங்கள் உடல் முற்றிலும் அமைதியாக உள்ளது.',
          ml: 'നിങ്ങളുടെ ശരീരം തികച്ചും ശാന്തമാണ്.',
        }
      },
    ]
  },
  {
    id: 'morning_focus', title: 'Morning Focus & Clarity', category: 'Focus', icon: '🌅',
    color: '#f59e0b', duration: 150, difficulty: 'Beginner', defaultAmbient: 'alpha432',
    moodMatch: ['neutral', 'joy'],
    description: 'Awaken mental clarity and set a confident intention for the day ahead.',
    whyGeneric: 'Start your day with clear focus and calm confidence.',
    phases: [
      {
        start: 0, end: 25, breath: { inhale: 4, hold: 2, exhale: 4 },
        instruction: {
          en: 'Sit tall with an open chest. Welcome this fresh new moment.',
          hi: 'सीधे बैठें और सीना खुला रखें। इस नए खूबसूरत पल का स्वागत करें।',
          mr: 'ताठ बसा आणि छाती खुली ठेवा. या नवीन क्षणाचे स्वागत करा.',
          ta: 'நேராக அமருங்கள். இந்த புதிய தருணத்தை வரவேற்கவும்.',
          ml: 'നേരെ ഇരിക്കുക. ഈ പുതിയ നിമിഷത്തെ സ്വാഗതം ചെയ്യുക.',
        },
        voice: {
          en: 'Sit tall. Welcome this fresh new moment.',
          hi: 'सीधे बैठें। इस नए पल का स्वागत करें।',
          mr: 'ताठ बसा. या नवीन दिवसाचे स्वागत करा.',
          ta: 'நேராக அமர்ந்து இந்த புதிய நாளை வரவேற்கவும்.',
          ml: 'നേരെ ഇരിക്കുക. ഈ പുതിയ പ്രഭാതത്തെ സ്വാഗതം ചെയ്യുക.',
        }
      },
      {
        start: 25, end: 55, breath: { inhale: 5, hold: 3, exhale: 5 },
        instruction: {
          en: 'Take a deep, invigorating breath in. Fill your lungs with fresh energy.',
          hi: 'एक गहरी, ऊर्जावान सांस अंदर लें। फेफड़ों को ताजी ऊर्जा से भरें।',
          mr: 'दीर्घ आणि उत्साही श्वास घ्या. फुफ्फुसे ताजी ऊर्जेने भरा.',
          ta: 'ஆழமாக சுவாசித்து புதிய ஆற்றலை உணருங்கள்.',
          ml: 'ദീർഘമായി ശ്വാസമെടുത്ത് പുതിയ ഊർജ്ജം നിറയ്ക്കുക.',
        },
        voice: {
          en: 'Take a deep breath in. Fill your lungs with energy.',
          hi: 'गहरी सांस लें और ऊर्जा को महसूस करें।',
          mr: 'दीर्घ श्वास घ्या आणि नवीन ऊर्जा अनुभवा.',
          ta: 'ஆழமாக மூச்சை உள்ளிழுத்து ஆற்றலை நிரப்புங்கள்.',
          ml: 'ആഴത്തിൽ ശ്വാസമെടുക്കുക, ഊർജ്ജം നിറയ്ക്കുക.',
        }
      },
      {
        start: 55, end: 85, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Exhale with clarity. Clear away any morning fog or hesitation.',
          hi: 'सांस छोड़ते हुए सभी आलस और संशय को दूर करें।',
          mr: 'श्वास सोडताना आळस आणि शंका दूर करा.',
          ta: 'சுவாசத்தை வெளிவிட்டு சோம்பலை நீக்குங்கள்.',
          ml: 'ശ്വാസം പുറത്തുവിട്ട് മടി അകറ്റുക.',
        },
        voice: {
          en: 'Exhale with clarity. Clear away any hesitation.',
          hi: 'स्पष्टता के साथ सांस छोड़ें। सभी झिझक दूर करें।',
          mr: 'स्पष्टतेने श्वास सोडा. सर्व आळस दूर करा.',
          ta: 'தெளிவுடன் மூச்சை வெளிவிடுங்கள்.',
          ml: 'വ്യക്തതയോടെ ശ്വാസം പുറത്തുവിടുക.',
        }
      },
      {
        start: 85, end: 120, breath: { inhale: 5, hold: 3, exhale: 6 },
        instruction: {
          en: 'Set an intention for today: calm focus, steady presence, and kindness.',
          hi: 'आज के लिए एक संकल्प लें: शांत एकाग्रता और दयालुता।',
          mr: 'आजचा संकल्प करा: शांत एकाग्रता आणि सकारात्मकता.',
          ta: 'இன்றைய நாளுக்கான நல்லெண்ணத்தை உருவாக்குங்கள்.',
          ml: 'ഇന്നത്തെ ദിവസത്തിനായി നല്ലൊരു ലക്ഷ്യം വെയ്ക്കുക.',
        },
        voice: {
          en: 'Set your intention. Calm focus, steady presence, and kindness.',
          hi: 'अपना संकल्प तय करें: शांत मन और दृढ़ एकाग्रता।',
          mr: 'आपला संकल्प निश्चित करा: शांत मन आणि एकाग्रता.',
          ta: 'மனதில் அமைதியையும் கவனத்தையும் நிலைநிறுத்துங்கள்.',
          ml: 'മനസ്സിൽ ഏകാഗ്രതയും സമാധാനവും നിലനിർത്തുക.',
        }
      },
      {
        start: 120, end: 150, breath: { inhale: 4, hold: 2, exhale: 5 },
        instruction: {
          en: 'Trust your ability to handle whatever comes today. You are ready.',
          hi: 'अपनी क्षमता पर विश्वास रखें। आप आज के दिन के लिए पूरी तरह तैयार हैं।',
          mr: 'स्वतःच्या क्षमतेवर विश्वास ठेवा. तुम्ही सज्ज आहात.',
          ta: 'உங்கள் மீது நம்பிக்கை வையுங்கள். நீங்கள் தயாராக உள்ளீர்கள்.',
          ml: 'സ്വയം വിശ്വസിക്കുക. നിങ്ങൾ പൂർണ്ണ സജ്ജനാണ്.',
        },
        voice: {
          en: 'Trust yourself. You are ready for today.',
          hi: 'खुद पर भरोसा रखें। आप तैयार हैं।',
          mr: 'स्वतःवर विश्वास ठेवा. तुम्ही सज्ज आहात.',
          ta: 'உங்களை நம்புங்கள். நீங்கள் தயாராக உள்ளீர்கள்.',
          ml: 'സ്വയം വിശ്വസിക്കുക. നിങ്ങൾ തയ്യാറാണ്.',
        }
      },
    ]
  },
  {
    id: 'sleep_winddown', title: 'Evening Sleep Wind-Down', category: 'Sleep', icon: '🌙',
    color: '#6366f1', duration: 300, difficulty: 'Beginner', defaultAmbient: 'ocean',
    moodMatch: ['fear'],
    description: 'Quiet an overactive mind and prepare your body for deep, restorative sleep.',
    whyGeneric: 'When your mind won\'t quiet down, this gentle session helps you drift toward rest.',
    phases: [
      {
        start: 0, end: 40, breath: { inhale: 4, hold: 3, exhale: 7 },
        instruction: {
          en: 'Dim your surroundings. Let your eyes softly close. The day is complete.',
          hi: 'रोशनी कम करें और आँखें बंद करें। आज का दिन अब पूरा हो चुका है।',
          mr: 'प्रकाश कमी करा आणि डोळे मिटा. आजचा दिवस पूर्ण झाला आहे.',
          ta: 'விளக்குகளை குறைத்து கண்களை மூடுங்கள். இன்றைய நாள் முடிந்தது.',
          ml: 'വെളിച്ചം കുറച്ച് കണ്ണുകൾ അടയ്ക്കുക. ഇന്നത്തെ ദിവസം കഴിഞ്ഞു.',
        },
        voice: {
          en: 'Dim your surroundings. Let your eyes close. The day is complete.',
          hi: 'आंखें बंद करें। आज का दिन पूरा हो चुका है।',
          mr: 'डोळे मिटा. आजचा दिवस समाप्त झाला आहे.',
          ta: 'கண்களை மூடுங்கள். இன்றைய நாள் முடிவடைந்தது.',
          ml: 'കണ്ണുകൾ അടയ്ക്കുക. ഇന്നത്തെ ദിവസം പൂർത്തിയായി.',
        }
      },
      {
        start: 40, end: 90, breath: { inhale: 4, hold: 3, exhale: 8 },
        instruction: {
          en: 'There is nothing left for you to do. Every task can wait until tomorrow.',
          hi: 'अब करने के लिए कुछ नहीं बचा है। हर काम कल तक इंतजार कर सकता है।',
          mr: 'आता काहीही करण्याची गरज नाही. सर्व कामे उद्यापर्यंत थांबू शकतात.',
          ta: 'இனி செய்வதற்கு எதுவுமில்லை. அனைத்தும் நாளை பார்த்துக் கொள்ளலாம்.',
          ml: 'ഇനി ഒന്നും ചെയ്യേണ്ടതില്ല. എല്ലാം നാളത്തേക്ക് മാറ്റിവെക്കാം.',
        },
        voice: {
          en: 'There is nothing left to do. Everything can wait.',
          hi: 'अब सब कुछ छोड़ दें। हर काम कल हो सकता है।',
          mr: 'सर्व विचार सोडून द्या. सर्व कामे उद्या होतील.',
          ta: 'அனைத்து வேலைகளையும் தள்ளி வையுங்கள்.',
          ml: 'എല്ലാം മാറ്റിവെക്കുക. മനസ്സ് ശാന്തമാക്കുക.',
        }
      },
      {
        start: 90, end: 140, breath: { inhale: 5, hold: 4, exhale: 8 },
        instruction: {
          en: 'Take a deep, slow breath in, and let your whole body sink deeper.',
          hi: 'एक गहरी, धीमी सांस लें और पूरे शरीर को विश्राम में डूबने दें।',
          mr: 'दीर्घ आणि हळुवार श्वास घ्या आणि शरीर विश्रांतीत सोपवा.',
          ta: 'ஆழமாக சுவாசித்து உடலை ஆழ்ந்த ஓய்வுக்கு கொண்டு செல்லுங்கள்.',
          ml: 'ദീർഘമായി ശ്വാസമെടുത്ത് ശരീരത്തെ പൂർണ്ണ വിശ്രമത്തിലേക്ക് വിടുക.',
        },
        voice: {
          en: 'Take a deep slow breath. Let your body sink.',
          hi: 'धीमी गहरी सांस लें। शरीर को ढीला छोड़ें।',
          mr: 'हळूच दीर्घ श्वास घ्या. शरीर सैल सोडा.',
          ta: 'ஆழமாக சுவாசித்து உடலை தளர்த்துங்கள்.',
          ml: 'പതുക്കെ ശ്വാസമെടുത്ത് ശരീരം അയക്കുക.',
        }
      },
      {
        start: 140, end: 190, breath: { inhale: 4, hold: 3, exhale: 8 },
        instruction: {
          en: 'With every exhale, imagine tension melting away into the night.',
          hi: 'हर सांस छोड़ने के साथ तनाव को रात के अंधेरे में विलीन होते महसूस करें।',
          mr: 'प्रत्येक श्वासासोबत तणाव नाहीसा होत असल्याचे अनुभवा.',
          ta: 'ஒவ்வொரு முறை மூச்சை வெளிவிடும்போதும் அமைதியை உணருங்கள்.',
          ml: 'ഓരോ തവണ ശ്വാസം പുറത്തുവിടുമ്പോഴും പിരിമുറുക്കം അകലട്ടെ.',
        },
        voice: {
          en: 'With every exhale, tension melts away.',
          hi: 'सांस के साथ सभी तनाव बाहर निकल रहे हैं।',
          mr: 'श्वासासोबत सर्व तणाव विरघळून जात आहे.',
          ta: 'அனைத்து இறுக்கமும் மறைந்து அமைதி நிலவுகிறது.',
          ml: 'എല്ലാ ടെൻഷനുകളും അകന്നുപോവുന്നു.',
        }
      },
      {
        start: 190, end: 240, breath: { inhale: 4, hold: 4, exhale: 9 },
        instruction: {
          en: 'Your mind is quiet like calm, still water. Completely peaceful.',
          hi: 'आपका मन शांत पानी की तरह स्थिर और प्रशांत है।',
          mr: 'तुमचे मन शांत पाण्यासारखे स्थिर आणि निश्चल आहे.',
          ta: 'உங்கள் மனம் அமைதியான நீரைப் போல சலனமற்று உள்ளது.',
          ml: 'നിങ്ങളുടെ മനസ്സ് ശാന്തമായ ജലാശയം പോലെ നിശ്ചലമാണ്.',
        },
        voice: {
          en: 'Your mind is quiet like still water.',
          hi: 'आपका मन शांत झील की तरह स्थिर है।',
          mr: 'तुमचे मन शांत आणि निश्चल आहे.',
          ta: 'உங்கள் மனம் அமைதியாக உள்ளது.',
          ml: 'നിങ്ങളുടെ മനസ്സ് തികച്ചും ശാന്തമാണ്.',
        }
      },
      {
        start: 240, end: 275, breath: { inhale: 4, hold: 4, exhale: 9 },
        instruction: {
          en: 'Surrender to rest. You are safe, comforted, and cared for.',
          hi: 'विश्राम में लीन हो जाएं। आप पूरी तरह सुरक्षित हैं।',
          mr: 'विश्रांतीमध्ये लीन व्हा. तुम्ही सुरक्षित आहात.',
          ta: 'ஓய்வெடுங்கள். நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள்.',
          ml: 'വിശ്രമിക്കുക. നിങ്ങൾ തികച്ചും സുരക്ഷിതനാണ്.',
        },
        voice: {
          en: 'Surrender to rest. You are safe.',
          hi: 'विश्राम करें। आप सुरक्षित हैं।',
          mr: 'विश्रांती घ्या. तुम्ही सुरक्षित आहात.',
          ta: 'ஆழ்ந்த தூக்கத்திற்கு தயாராகுங்கள்.',
          ml: 'സുഖമായി വിശ്രമിക്കുക.',
        }
      },
      {
        start: 275, end: 300, breath: { inhale: 4, hold: 4, exhale: 10 },
        instruction: {
          en: 'Drift gently into sweet, restorative sleep...',
          hi: 'एक मीठी, सुखद और गहरी नींद में खो जाएं...',
          mr: 'गोड आणि गाढ झोपेत लीन व्हा...',
          ta: 'ஆழ்ந்த நிம்மதியான உறக்கத்திற்கு செல்லுங்கள்...',
          ml: 'സുഖകരമായ നിദ്രയിലേക്ക് ആണ്ടുപോവുക...',
        },
        voice: {
          en: 'Drift into sleep.',
          hi: 'सुखद और गहरी नींद में जाएं।',
          mr: 'गाढ झोपेत लीन व्हा.',
          ta: 'இனிய உறக்கம்.',
          ml: 'സുഖനിദ്ര ആശംസിക്കുന്നു.',
        }
      },
    ]
  },
  {
    id: 'anxiety_reset', title: 'Anxiety & Overthinking Reset', category: 'Grounding', icon: '🍃',
    color: '#06b6d4', duration: 180, difficulty: 'Beginner', defaultAmbient: 'rain',
    moodMatch: ['surprise'],
    description: 'Ground yourself with slow breathing when your thoughts are racing.',
    whyGeneric: 'A simple grounding exercise to slow racing thoughts and find steady ground.',
    phases: [
      {
        start: 0, end: 25, breath: { inhale: 4, hold: 2, exhale: 4 },
        instruction: {
          en: 'Stop. Plant your feet flat on the floor. Feel the ground supporting you.',
          hi: 'रुकें। अपने पैरों को जमीन पर टिकाएं और स्थिरता महसूस करें।',
          mr: 'थांबा. आपले पाय जमिनीवर घट्ट ठेवा आणि स्थिरता अनुभवा.',
          ta: 'நிறுத்துங்கள். கால்களை தரையில் ஊன்றி அமைதியை உணருங்கள்.',
          ml: 'നിൽക്കുക. പാദങ്ങൾ തറയിൽ ഉറപ്പിച്ച് സ്ഥിരത അനുഭവിക്കുക.',
        },
        voice: {
          en: 'Stop. Plant your feet flat on the floor.',
          hi: 'रुकें। पैरों को जमीन पर टिकाएं।',
          mr: 'थांबा. पाय जमिनीवर स्थिर ठेवा.',
          ta: 'கால்களை தரையில் ஊன்றி நேராக அமருங்கள்.',
          ml: 'പാദങ്ങൾ തറയിൽ ഉറപ്പിച്ചു നിർത്തുക.',
        }
      },
      {
        start: 25, end: 55, breath: { inhale: 4, hold: 3, exhale: 5 },
        instruction: {
          en: 'Name 5 things you can see. This is about being here, right now.',
          hi: 'अपने आस-पास दिखने वाली 5 चीजों को देखें। वर्तमान क्षण में रहें।',
          mr: 'आसपासच्या ५ गोष्टी पहा. वर्तमान क्षणात उपस्थित राहा.',
          ta: 'சுற்றியுள்ள 5 விஷயங்களை கவனியுங்கள். இந்த கணத்தில் வாழுங்கள்.',
          ml: 'ചുറ്റുമുള്ള 5 കാര്യങ്ങൾ ശ്രദ്ധിക്കുക. ഈ നിമിഷത്തിൽ ജീവിക്കുക.',
        },
        voice: {
          en: 'Name 5 things you can see around you.',
          hi: 'अपने आस-पास की 5 चीजों को ध्यान से देखें।',
          mr: 'आसपासच्या ५ गोष्टींकडे लक्ष द्या.',
          ta: 'சுற்றியுள்ள 5 பொருட்களை கவனியுங்கள்.',
          ml: 'ചുറ്റുമുള്ള 5 വസ്തുക്കൾ ശ്രദ്ധിക്കുക.',
        }
      },
      {
        start: 55, end: 90, breath: { inhale: 4, hold: 4, exhale: 6 },
        instruction: {
          en: 'Inhale slowly for 4 counts. Hold for 4. Exhale for 6. Repeat.',
          hi: '4 सेकंड सांस लें। 4 सेकंड रोकें। 6 सेकंड में छोड़ें।',
          mr: '४ सेकंद श्वास घ्या. ४ सेकंद थांबा. ६ सेकंदात सोडा.',
          ta: '4 விநாடிகள் உள்ளிழுக்கவும். 4 விநாடிகள் நிறுத்தவும். 6 விநாடிகளில் வெளிவிடவும்.',
          ml: '4 സെക്കൻഡ് ശ്വാസമെടുക്കുക. 4 സെക്കൻഡ് പിടിക്കുക. 6 സെക്കൻഡിൽ വിടുക.',
        },
        voice: {
          en: 'Inhale slowly for 4. Hold for 4. Exhale for 6.',
          hi: 'सांस अंदर लें... रोकें... और धीरे-धीरे छोड़ें।',
          mr: 'श्वास आत घ्या... थांबा... आणि हळूच सोडा.',
          ta: 'மூச்சை உள்ளிழுக்கவும்... நிறுத்தவும்... வெளிவிடவும்.',
          ml: 'ശ്വാസം എടുക്കുക... പിടിക്കുക... പതുക്കെ വിടുക.',
        }
      },
      {
        start: 90, end: 125, breath: { inhale: 4, hold: 4, exhale: 6 },
        instruction: {
          en: 'Your thoughts are clouds passing through. You are the sky. Vast and still.',
          hi: 'विचार बादलों की तरह आते-जाते हैं। आप विशाल और स्थिर आकाश हैं।',
          mr: 'विचार ढगांसारखे येतात आणि जातात. तुम्ही अथांग आकाश आहात.',
          ta: 'எண்ணங்கள் மேகங்கள் போன்றவை. நீங்கள் பரந்த வானம்.',
          ml: 'ചിന്തകൾ മേഘങ്ങളെപ്പോലെ കടന്നുപോകുന്നു. നിങ്ങൾ ആകാശമാണ്.',
        },
        voice: {
          en: 'Your thoughts are clouds passing through. You are the sky.',
          hi: 'विचार बादलों की तरह हैं। आप शांत आकाश हैं।',
          mr: 'विचार ढगांसारखे आहेत. तुम्ही स्थिर आकाश आहात.',
          ta: 'எண்ணங்களை கடந்து செல்ல விடுங்கள்.',
          ml: 'ചിന്തകളെ കടന്നുപോകാൻ അനുവദിക്കുക.',
        }
      },
      {
        start: 125, end: 155, breath: { inhale: 4, hold: 3, exhale: 7 },
        instruction: {
          en: 'Place one hand on your chest. Feel your heartbeat slowing, steadying.',
          hi: 'एक हाथ छाती पर रखें। दिल की धड़कन को शांत और स्थिर होते महसूस करें।',
          mr: 'एक हात छातीवर ठेवा. हृदयाचे ठोके शांत होत असल्याचे अनुभवा.',
          ta: 'ஒரு கையை நெஞ்சில் வையுங்கள். இதய துடிப்பு அமைதியாவதை உணருங்கள்.',
          ml: 'ഒരു കൈ നെഞ്ചിൽ വെയ്ക്കുക. ഹൃദയമിടിപ്പ് ശാന്തമാകുന്നത് അറിയുക.',
        },
        voice: {
          en: 'Place a hand on your chest. Feel your heartbeat steadying.',
          hi: 'हाथ छाती पर रखें और दिल की धड़कन महसूस करें।',
          mr: 'छातीवर हात ठेवून हृदयाची धडधड अनुभवा.',
          ta: 'இதயத் துடிப்பை அமைதியாக கவனியுங்கள்.',
          ml: 'ഹൃദയമിടിപ്പ് ശാന്തമായി ശ്രദ്ധിക്കുക.',
        }
      },
      {
        start: 155, end: 180, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'You are safe. You are grounded. Return to your day with calm clarity.',
          hi: 'आप सुरक्षित हैं और शांत हैं। स्पष्टता के साथ अपने दिन में वापस लौटें।',
          mr: 'तुम्ही सुरक्षित आणि शांत आहात. नव्या आत्मविश्वासाने दिवसाकडे वळा.',
          ta: 'நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள். தெளிவுடன் நாளை தொடருங்கள்.',
          ml: 'നിങ്ങൾ സുരക്ഷിതനും ശാന്തനുമാണ്. വ്യക്തതയോടെ മുന്നോട്ട് പോവുക.',
        },
        voice: {
          en: 'You are safe. You are grounded. Return with calm clarity.',
          hi: 'आप पूरी तरह सुरक्षित हैं। शांत मन से आगे बढ़ें।',
          mr: 'तुम्ही सुरक्षित आहात. शांत मनाने पुढे चला.',
          ta: 'நீங்கள் பாதுகாப்பாக உள்ளீர்கள். அமைதியாக இருங்கள்.',
          ml: 'നിങ്ങൾ തികച്ചും സുരക്ഷിതനാണ്. ശാന്തമായിരിക്കുക.',
        }
      },
    ]
  },
  {
    id: 'body_scan', title: 'Mindful Body Scan', category: 'Mindfulness', icon: '🧘',
    color: '#ec4899', duration: 300, difficulty: 'Intermediate', defaultAmbient: 'singing_bowl',
    moodMatch: [],
    description: 'A detailed head-to-toe awareness practice for deep physical and mental release.',
    whyGeneric: 'A mindful scan of your body to notice and release what you are holding.',
    phases: [
      {
        start: 0, end: 35, breath: { inhale: 4, hold: 2, exhale: 5 },
        instruction: {
          en: 'Settle into stillness. Let your body become heavy and grounded.',
          hi: 'पूरी तरह स्थिर हो जाएं। शरीर को ढीला और शांत छोड़ें।',
          mr: 'शांत बसा. शरीर सैल आणि स्थिर सोडा.',
          ta: 'முற்றிலும் அமைதியாக இருங்கள். உடலை தளர்த்துங்கள்.',
          ml: 'പൂർണ്ണ ശാന്തതയിലേക്ക് മാറുക. ശരീരം അയച്ചുവിടുക.',
        },
        voice: {
          en: 'Settle into stillness. Let your body become heavy.',
          hi: 'स्थिरता में बैठें। शरीर को शांत होने दें।',
          mr: 'शांत बसा. शरीराला विश्रांती द्या.',
          ta: 'அமைதியாக அமர்ந்து உடலை தளர்த்தவும்.',
          ml: 'ശാന്തമായി ഇരുന്ന് ശരീരം അയക്കുക.',
        }
      },
      {
        start: 35, end: 75, breath: { inhale: 4, hold: 2, exhale: 5 },
        instruction: {
          en: 'Bring attention to the top of your head. Notice any sensation without judgment.',
          hi: 'सिर के ऊपरी हिस्से पर ध्यान दें। किसी भी अहसास को बिना किसी निर्णय के महसूस करें।',
          mr: 'डोक्याच्या वरच्या भागावर लक्ष द्या.',
          ta: 'தலையின் உச்சிப் பகுதியில் கவனம் செலுத்துங்கள்.',
          ml: 'തലയുടെ മുകളിൽ ശ്രദ്ധിക്കുക.',
        },
        voice: {
          en: 'Bring attention to the top of your head.',
          hi: 'सिर के ऊपर अपना ध्यान केंद्रित करें।',
          mr: 'डोक्यावर लक्ष केंद्रित करा.',
          ta: 'தலையின் உச்சியில் கவனம் செலுத்துங்கள்.',
          ml: 'തലയുടെ മുകൾഭാഗത്ത് ശ്രദ്ധിക്കുക.',
        }
      },
      {
        start: 75, end: 115, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Scan down to your forehead, eyes, cheeks, and jaw. Release each one.',
          hi: 'माथा, आँखें, गाल और जबड़ा — हर अंग को क्रम से ढीला छोड़ते जाएं।',
          mr: 'कपाळ, डोळे, गाल आणि जबडा — सर्व अवयव सैल सोडा.',
          ta: 'நெற்றி, கண்கள், கன்னங்கள் மற்றும் தாடையை தளர்த்தவும்.',
          ml: 'നെറ്റി, കണ്ണുകൾ, കവിളുകൾ, താടി എന്നിവ അയക്കുക.',
        },
        voice: {
          en: 'Scan down to your face. Release each area gently.',
          hi: 'चेहरे के हर भाग को ढीला छोड़ें।',
          mr: 'चेहऱ्याचे सर्व भाग सैल सोडा.',
          ta: 'முகத்தின் அனைத்து பகுதிகளையும் தளர்த்தவும்.',
          ml: 'മുഖത്തെ ഓരോ ഭാഗവും സാവധാനം അയക്കുക.',
        }
      },
      {
        start: 115, end: 155, breath: { inhale: 5, hold: 3, exhale: 6 },
        instruction: {
          en: 'Feel your neck, shoulders, and upper back. Breathe warmth into any tightness.',
          hi: 'गर्दन, कंधे और पीठ को महसूस करें। जहाँ भी तनाव हो, वहाँ सांस की गर्माहट भेजें।',
          mr: 'मान, खांदे आणि पाठीवर लक्ष द्या. तणाव दूर करा.',
          ta: 'கழுத்து, தோள்கள் மற்றும் முதுகில் உள்ள இறுக்கத்தை நீக்குங்கள்.',
          ml: 'കഴുത്ത്, തോളുകൾ, പുറംഭാഗം എന്നിവയിലെ പിരിമുറുക്കം മാറ്റുക.',
        },
        voice: {
          en: 'Feel your neck and shoulders. Breathe warmth into any tightness.',
          hi: 'गर्दन और कंधों को पूरी तरह तनावमुक्त करें।',
          mr: 'मान आणि खांदे पूर्णपणे तणावमुक्त करा.',
          ta: 'கழுத்து மற்றும் தோள்பட்டையை தளர்த்தவும்.',
          ml: 'കഴുത്തും തോളും പൂർണ്ണമായി അയക്കുക.',
        }
      },
      {
        start: 155, end: 195, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Notice your arms, wrists, and fingertips. Let them be completely still.',
          hi: 'हाथों, कलाइयों और उंगलियों को महसूस करें। उन्हें पूरी तरह स्थिर छोड़ें।',
          mr: 'हात आणि बोटांकडे लक्ष द्या. त्यांना स्थिर ठेवा.',
          ta: 'கைகளையும் விரல்களையும் முற்றிலும் அமைதியாக இருக்க விடுங்கள்.',
          ml: 'കൈകളും വിരലുകളും പൂർണ്ണമായി നിശ്ചലമാക്കുക.',
        },
        voice: {
          en: 'Notice your arms and hands. Let them be still.',
          hi: 'हाथों और बाहों को पूरी तरह स्थिर और शांत रखें।',
          mr: 'हात स्थिर आणि शांत ठेवा.',
          ta: 'கைகளை அமைதியாக வையுங்கள்.',
          ml: 'കൈകൾ ശാന്തമായി വെക്കുക.',
        }
      },
      {
        start: 195, end: 235, breath: { inhale: 5, hold: 3, exhale: 7 },
        instruction: {
          en: 'Move awareness into your torso — chest, stomach, lower back. Soften.',
          hi: 'सीना, पेट और निचली पीठ — पूरे धड़ को कोमल और तनावमुक्त करें।',
          mr: 'छाती, पोट आणि पाठ सैल सोडा.',
          ta: 'மார்பு, வயிறு மற்றும் கீழ் முதுகை தளர்த்தவும்.',
          ml: 'നെഞ്ചും വയറും പുറംഭാഗവും അയക്കുക.',
        },
        voice: {
          en: 'Move awareness into your torso. Soften.',
          hi: 'छाती और पेट को पूरी तरह ढीला छोड़ें।',
          mr: 'छाती आणि पोट सैल सोडा.',
          ta: 'மார்பு மற்றும் வயிற்றுப் பகுதியை தளர்த்தவும்.',
          ml: 'നെഞ്ചും വയറും അയച്ചു ശാന്തമാക്കുക.',
        }
      },
      {
        start: 235, end: 275, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Scan down through your hips, thighs, knees, calves, and feet. Release.',
          hi: 'जांघों, घुटनों और पैरों के पंजों तक ध्यान ले जाएं। सब कुछ ढीला छोड़ें।',
          mr: 'मांडी, गुडघे आणि तळपायांकडे लक्ष द्या. सर्व तणाव सोडा.',
          ta: 'இடுப்பு முதல் பாதங்கள் வரை உள்ள அனைத்து உறுப்புகளையும் தளர்த்தவும்.',
          ml: 'തുടകൾ മുതൽ പാദങ്ങൾ വരെയുള്ള ഭാഗങ്ങൾ അയച്ചുവിടുക.',
        },
        voice: {
          en: 'Scan through your legs and feet. Release everything.',
          hi: 'पैरों और पंजों को पूरी तरह तनावमुक्त करें।',
          mr: 'पाय आणि तळपाय पूर्णपणे शिथिल करा.',
          ta: 'கால்களை தளர்த்தி ஓய்வெடுக்க விடுங்கள்.',
          ml: 'കാലുകൾ അയച്ച് പൂർണ്ണമായി വിശ്രമിക്കുക.',
        }
      },
      {
        start: 275, end: 300, breath: { inhale: 5, hold: 4, exhale: 8 },
        instruction: {
          en: 'Your whole body is scanned, relaxed, and at peace. Rest here.',
          hi: 'आपका संपूर्ण शरीर पूरी तरह तनावमुक्त और शांत है। इसी शांति में रहें।',
          mr: 'तुमचे संपूर्ण शरीर शांत आणि तणावमुक्त झाले आहे. येथेच विश्रांती घ्या.',
          ta: 'உங்கள் முழு உடலும் ஆழ்ந்த அமைதியில் உள்ளது. இங்கேயே ஓய்வெடுங்கள்.',
          ml: 'നിങ്ങളുടെ ശരീരം മുഴുവൻ ശാന്തതയിലാണ്. ഇവിടെ വിശ്രമിക്കുക.',
        },
        voice: {
          en: 'Your whole body is at peace. Rest here.',
          hi: 'आपका संपूर्ण शरीर परम शांति में है। विश्राम करें।',
          mr: 'तुमचे शरीर शांततेत आहे. विश्रांती घ्या.',
          ta: 'உங்கள் உடல் முற்றிலும் அமைதியில் உள்ளது.',
          ml: 'നിങ്ങളുടെ ശരീരം ശാന്തതയിലാണ്. വിശ്രമിക്കുക.',
        }
      },
    ]
  },
]

// ─── Ambient Sound Options ─────────────────────────────────────────────────
