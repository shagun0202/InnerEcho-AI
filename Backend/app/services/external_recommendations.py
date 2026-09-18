import urllib.parse
import random

def get_external_recommendations(emotion):
    recs = []
    
    # Music
    genre = "lo-fi beats, instrumental"
    if emotion in ["sadness", "grief", "disappointment", "embarrassment", "remorse"]:
        genre = "calming acoustic, lo-fi, ambient"
    elif emotion in ["joy", "amusement", "excitement", "love", "gratitude", "optimism", "pride", "relief", "admiration", "approval", "caring"]:
        genre = "upbeat pop, feel-good indie"
    elif emotion in ["anger", "annoyance", "disapproval", "disgust"]:
        genre = "instrumental classical, nature sounds"
    elif emotion in ["fear", "nervousness", "surprise", "confusion", "realization"]:
        genre = "meditation music, nature sounds"
        
    query = urllib.parse.quote(genre)
    recs.append({
        "type": "music",
        "title": "Curated Playlist",
        "description": f"Music to match your mood: {genre}",
        "url": f"https://open.spotify.com/search/{query}/playlists",
        "icon": "music"
    })
    
    # Movies (20-30 feel-good movies)
    movies = [
        ("Amélie", "2001", "feel-good"),
        ("Paddington 2", "2017", "comedy, family"),
        ("Spirited Away", "2001", "animation, adventure"),
        ("The Princess Bride", "1987", "fantasy, romance"),
        ("My Neighbor Totoro", "1988", "animation, family"),
        ("Little Miss Sunshine", "2006", "comedy, drama"),
        ("Before Sunrise", "1995", "romance"),
        ("Singin' in the Rain", "1952", "musical, comedy"),
        ("Fantastic Mr. Fox", "2009", "animation, comedy"),
        ("School of Rock", "2003", "comedy, music"),
        ("Ratatouille", "2007", "animation, family"),
        ("Ferris Bueller's Day Off", "1986", "comedy"),
        ("Clueless", "1995", "comedy, romance"),
        ("Legally Blonde", "2001", "comedy"),
        ("Chef", "2014", "comedy, drama"),
        ("The Truman Show", "1998", "drama, comedy"),
        ("E.T. the Extra-Terrestrial", "1982", "family, sci-fi"),
        ("WALL-E", "2008", "animation, sci-fi"),
        ("Up", "2009", "animation, adventure"),
        ("Coco", "2017", "animation, music"),
        ("Kiki's Delivery Service", "1989", "animation, family"),
        ("When Harry Met Sally...", "1989", "romance, comedy"),
        ("Groundhog Day", "1993", "comedy, fantasy"),
        ("Mary Poppins", "1964", "family, musical"),
        ("The Sound of Music", "1965", "family, musical"),
        ("A Hard Day's Night", "1964", "comedy, music"),
        ("Mamma Mia!", "2008", "comedy, musical"),
        ("Toy Story", "1995", "animation, family"),
        ("Shrek", "2001", "animation, comedy"),
        ("The Grand Budapest Hotel", "2014", "comedy, drama")
    ]
    
    selected_movies = random.sample(movies, 2)
    for title, year, tags in selected_movies:
        q = urllib.parse.quote(f"{title} {year}")
        recs.append({
            "type": "movie",
            "title": f"{title} ({year})",
            "description": f"A highly-rated calming movie ({tags}).",
            "url": f"https://letterboxd.com/search/films/{q}/",
            "icon": "play"
        })
        
    # Outdoor
    outdoor_query = urllib.parse.quote("parks cafes trails gardens")
    recs.append({
        "type": "outdoor",
        "title": "Nearby Parks & Cafes",
        "description": "Step outside for a change of environment.",
        "url": f"https://www.google.com/maps/search/{outdoor_query}",
        "icon": "pin"
    })
    
    # Social
    recs.append({
        "type": "social",
        "title": "Connect with Someone",
        "description": "A good conversation starter can help shift your perspective.",
        "url": "#",
        "icon": "people"
    })
    
    return random.sample(recs, 3) # Return 3 recommendations
