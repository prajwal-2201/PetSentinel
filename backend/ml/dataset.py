"""
ML Dataset — synthetic but clinically realistic labeled pet symptom descriptions.
Each sample: (text, severity_label)
  SAFE     → routine question, no urgency
  MONITOR  → watch for 24h, call vet if worsens
  URGENT   → see vet within hours
  CRITICAL → go to emergency vet NOW
"""
from typing import List, Tuple

SYMPTOM_DATASET: List[Tuple[str, str]] = [
    # ── SAFE ──────────────────────────────────────────────────────────────────
    ("my dog is eating normally and playing but seems a little tired today", "SAFE"),
    ("cat sneezed twice this morning, no discharge, eating fine", "SAFE"),
    ("rabbit is drinking more water than usual but acting normally", "SAFE"),
    ("dog scratching ear occasionally, no odor or discharge visible", "SAFE"),
    ("cat seems to be sleeping more than usual, eating well", "SAFE"),
    ("dog has mild dandruff on back, coat looks a bit dry", "SAFE"),
    ("puppy has soft stool once today but lively and eating", "SAFE"),
    ("my cat occasionally licks its paws, no redness observed", "SAFE"),
    ("dog has a small bump on the skin, no pain when touched", "SAFE"),
    ("kitten has one watery eye, eating and playing actively", "SAFE"),
    ("dog farting more than usual, no other symptoms", "SAFE"),
    ("cat hair looks slightly matted, otherwise healthy", "SAFE"),
    ("dog seems bored and chewing on toys more than usual", "SAFE"),
    ("rabbit is eating hay slowly, no signs of distress", "SAFE"),
    ("puppy is sleeping a lot after playing hard all day", "SAFE"),
    ("cat has a small scratch from playing, not deep", "SAFE"),
    ("dog drank from a puddle, no symptoms yet", "SAFE"),
    ("cat missed a meal but ate enthusiastically next feeding", "SAFE"),
    ("dog has slightly bad breath, otherwise normal", "SAFE"),
    ("cat sneezing intermittently for two days, no fever", "SAFE"),
    ("dog is shedding more than normal for the season", "SAFE"),
    ("puppy ate a small piece of cardboard, acting normally", "SAFE"),
    ("cat rubbing face on furniture, eating and drinking well", "SAFE"),
    ("dog walked through mud, paws look dirty, no cuts", "SAFE"),
    ("rabbit sitting still for longer than usual, eating when offered", "SAFE"),
    ("cat drank a tiny bit of milk, no immediate symptoms", "SAFE"),
    ("dog has a mild limp after long walk, not vocalizing pain", "SAFE"),
    ("kitten playing normally but seems a bit hyper", "SAFE"),
    ("dog occasionally shaking head, no ear odor", "SAFE"),
    ("cat producing more hairballs lately than usual season", "SAFE"),
    ("small dog gained a little weight over winter", "SAFE"),
    ("rabbit droppings are slightly smaller this morning", "SAFE"),
    ("dog seems to have a mild cold, slight nasal discharge", "SAFE"),
    ("cat has a small wart-like growth on chin, no irritation", "SAFE"),
    ("puppy refuses to eat kibble but ate wet food normally", "SAFE"),
    ("dog woke up with crust in corner of eye, now clear", "SAFE"),
    ("cat vomited once, acting normal, eating well after", "SAFE"),
    ("dog eating grass and vomited once, now playing", "SAFE"),
    ("rabbit not as active in afternoon heat, drinking water", "SAFE"),
    ("dog has slightly cloudy eyes, old age related", "SAFE"),

    # ── MONITOR ───────────────────────────────────────────────────────────────
    ("dog has been vomiting twice today and seems subdued", "MONITOR"),
    ("cat hasn't eaten for 24 hours but still drinking water", "MONITOR"),
    ("dog has loose stool for two days with small amounts of blood", "MONITOR"),
    ("cat is hiding under the bed and avoiding food", "MONITOR"),
    ("dog is limping and won't put weight on front paw", "MONITOR"),
    ("cat is peeing more frequently but no blood in urine", "MONITOR"),
    ("rabbit hasn't eaten hay for 12 hours, drinking water", "MONITOR"),
    ("dog is scratching ears intensely and shaking head frequently", "MONITOR"),
    ("puppy has mild diarrhea for 24 hours, still playful", "MONITOR"),
    ("cat has eye discharge both eyes, slightly lethargic", "MONITOR"),
    ("dog has a raised red lump that appeared overnight", "MONITOR"),
    ("cat vomited three times today, not eating", "MONITOR"),
    ("dog is drinking much more water than usual and urinating frequently", "MONITOR"),
    ("cat losing weight gradually over the last month", "MONITOR"),
    ("dog has mild cough that appears after exercise", "MONITOR"),
    ("rabbit is grinding teeth softly and holding ears flat", "MONITOR"),
    ("cat crying at night and seems restless, no visible injury", "MONITOR"),
    ("dog's abdomen looks slightly larger than normal", "MONITOR"),
    ("cat keeps going to litter box without producing much", "MONITOR"),
    ("puppy sneezing and has clear nasal discharge for two days", "MONITOR"),
    ("dog has yellow discharge from nose for three days", "MONITOR"),
    ("cat has patchy hair loss on belly no apparent cause", "MONITOR"),
    ("dog limping on rear leg after jumping off sofa", "MONITOR"),
    ("cat seems more aggressive than usual biting when touched", "MONITOR"),
    ("dog seems confused sometimes and bumps into furniture", "MONITOR"),
    ("rabbit droppings have been absent for 6 hours", "MONITOR"),
    ("cat has been coughing occasionally for three days", "MONITOR"),
    ("dog is licking paws obsessively leaving red staining", "MONITOR"),
    ("cat sleeping in litter box, refusing food", "MONITOR"),
    ("dog has swollen lymph nodes on neck discovered today", "MONITOR"),
    ("puppy has been scratching face leaving small abrasions", "MONITOR"),
    ("cat has been vocalizing more than usual especially at night", "MONITOR"),
    ("dog appeared dizzy when waking up, recovered after minute", "MONITOR"),
    ("cat has mild blood in stool once today", "MONITOR"),
    ("dog has foul smell from mouth that developed rapidly", "MONITOR"),
    ("rabbit cecotropes being left uneaten for two days", "MONITOR"),
    ("dog is whimpering when you touch his back left leg", "MONITOR"),
    ("cat drooling more than usual but eating normally", "MONITOR"),
    ("senior dog seems stiff getting up in the morning", "MONITOR"),
    ("kitten has mild swollen belly but no vomiting or diarrhea", "MONITOR"),

    # ── URGENT ────────────────────────────────────────────────────────────────
    ("dog has been vomiting every hour for six hours and is very weak", "URGENT"),
    ("cat has not eaten or drunk anything for 48 hours", "URGENT"),
    ("dog has bloody diarrhea with mucus and seems in pain", "URGENT"),
    ("cat is urinating blood and crying when trying to urinate", "URGENT"),
    ("dog bit by another dog, deep puncture wounds on neck", "URGENT"),
    ("cat eye looks swollen shut and has green discharge", "URGENT"),
    ("dog was stung by a bee, face is swelling", "URGENT"),
    ("puppy ate a grape about two hours ago", "URGENT"),
    ("cat has labored breathing after playing, panting heavily", "URGENT"),
    ("dog has infected wound that now smells and has pus", "URGENT"),
    ("rabbit has not passed droppings in 8 hours and is hunched", "URGENT"),
    ("cat completely stopped using litter box for two days and straining", "URGENT"),
    ("dog has severe diarrhea and is very dehydrated", "URGENT"),
    ("kitten severely limping and crying when leg is touched", "URGENT"),
    ("dog ate about half a bar of dark chocolate an hour ago", "URGENT"),
    ("cat seems very disoriented and walking in circles slowly", "URGENT"),
    ("dog has large hematoma on ear from shaking head", "URGENT"),
    ("cat has open wound across belly from unknown incident", "URGENT"),
    ("dog yelping in pain when trying to defecate", "URGENT"),
    ("puppy ate multiple xylitol-containing gum pieces", "URGENT"),
    ("cat's third eyelid visible both eyes, quite lethargic", "URGENT"),
    ("dog has been limping and now refusing to use leg at all", "URGENT"),
    ("rabbit breathing rapidly at over 60 breaths per minute", "URGENT"),
    ("cat cannot seem to open mouth fully and is drooling", "URGENT"),
    ("dog sneezing blood repeatedly for the last hour", "URGENT"),
    ("cat fell from balcony, walking slowly and seems dazed", "URGENT"),
    ("dog was bitten by a spider, bite site red and warm now swelling", "URGENT"),
    ("puppy has high fever 104.5F and won't stop shivering", "URGENT"),
    ("cat ate a peace lily plant three hours ago", "URGENT"),
    ("dog has severe eye redness and cloudiness in both eyes", "URGENT"),
    ("rabbit laid on side not moving but breathing, ears cold", "URGENT"),
    ("dog has been crying in pain for over two hours", "URGENT"),
    ("cat has swollen jaw on one side appeared yesterday", "URGENT"),
    ("dog urine looks dark orange like tea color", "URGENT"),
    ("cat has continuous sneezing with blood-tinged discharge", "URGENT"),
    ("senior dog collapsed briefly then got up, seemed confused", "URGENT"),
    ("dog ate a chicken bone and is pawing at mouth distressed", "URGENT"),
    ("kitten not nursing at all for 12 hours acting weak", "URGENT"),
    ("rabbit losing balance and falling to one side repeatedly", "URGENT"),
    ("dog has a hard non-movable lump that grew rapidly in one week", "URGENT"),

    # ── CRITICAL ──────────────────────────────────────────────────────────────
    ("dog is convulsing has been seizing for two minutes", "CRITICAL"),
    ("cat is completely unconscious and not responding", "CRITICAL"),
    ("dog has tongue hanging out and is extremely lethargic won't stand", "CRITICAL"),
    ("cat collapsed and cannot get up gums are pale white", "CRITICAL"),
    ("dog hit by a car bleeding heavily from abdomen", "CRITICAL"),
    ("cat swallowed rat poison about thirty minutes ago", "CRITICAL"),
    ("dog has distended bloated abdomen and is trying to vomit unsuccessfully", "CRITICAL"),
    ("cat has blue gums and gasping for breath", "CRITICAL"),
    ("dog with lethargy and tongue out lying on ground unresponsive", "CRITICAL"),
    ("cat neck stiff and tilted head circling cannot walk straight", "CRITICAL"),
    ("dog eyes glazed does not respond to name or touch", "CRITICAL"),
    ("cat with severe nervous system symptoms shaking all four limbs", "CRITICAL"),
    ("dog paralyzed back legs dragging them cannot stand", "CRITICAL"),
    ("cat ingested xylitol from sugar-free gum large amount", "CRITICAL"),
    ("dog choking on bone cannot breathe pawing at throat desperately", "CRITICAL"),
    ("cat has no pulse cold to touch barely breathing", "CRITICAL"),
    ("rabbit in full GI stasis 24 hours no droppings abdomen rigid painful", "CRITICAL"),
    ("dog trembling uncontrollably after eating onion-based food large amount", "CRITICAL"),
    ("cat with status epilepticus second seizure in thirty minutes", "CRITICAL"),
    ("dog unresponsive after falling from rooftop significant height", "CRITICAL"),
    ("cat drooling extremely and has dilated pupils after garden exposure", "CRITICAL"),
    ("dog prolapsed eye bulging out of socket after trauma", "CRITICAL"),
    ("cat aspirated water forced by owner now rattling breathing", "CRITICAL"),
    ("dog with lethargy tongue out shallow breathing and unresponsive to stimuli", "CRITICAL"),
    ("cat yellow jaundiced gums and belly swollen hardened", "CRITICAL"),
    ("dog severe head tilt rapid eye movement falling cannot walk", "CRITICAL"),
    ("puppy ingested human antidepressant medication two tablets", "CRITICAL"),
    ("cat urinary blockage 36 hours crying blood screaming in pain", "CRITICAL"),
    ("dog with severe aspiration from force feeding now not breathing normally", "CRITICAL"),
    ("cat cold unresponsive to touch only shallow breathing visible", "CRITICAL"),
    ("dog ate snail bait slug pellets showing nervous system signs", "CRITICAL"),
    ("cat eyeball partially out after being attacked", "CRITICAL"),
    ("dog large quantity grapes eaten vomiting profusely lethargic now", "CRITICAL"),
    ("cat with known heart disease collapsed and breathing with open mouth", "CRITICAL"),
    ("dog entire body trembling after exposure to lawn herbicide", "CRITICAL"),
    ("rabbit entire body limp after sudden fall eyes barely open", "CRITICAL"),
    ("dog lost bladder control suddenly combined with inability to walk", "CRITICAL"),
    ("cat having repeated vomiting blood dark brown material multiple times", "CRITICAL"),
    ("dog bitten by cobra or large venomous snake near face swelling fast", "CRITICAL"),
    ("cat not breathing after being found under sofa unresponsive", "CRITICAL"),

    # ── Additional variety ─────────────────────────────────────────────────────
    ("my older dog seems very lethargic lately and won't eat for two days", "URGENT"),
    ("cat is fine just drinking a lot and urinating a lot past week", "MONITOR"),
    ("puppy is limping but wagging tail and eating fine", "MONITOR"),
    ("rabbit not eating pellets but eating hay and moving normally", "SAFE"),
    ("dog ate a small amount of avocado an hour ago", "URGENT"),
    ("cat has been shaking head for a week, ears dark wax buildup", "MONITOR"),
    ("dog vomiting white foam early morning before breakfast", "MONITOR"),
    ("kitten very playful and healthy but has a runny nose", "SAFE"),
    ("cat blood in urine crying unable to urinate at all male cat", "CRITICAL"),
    ("dog fell down stairs yelping very loudly unable to bear weight at all", "URGENT"),
    ("rabbit hasn't moved in one hour ears warm but limp", "URGENT"),
    ("dog ate entire bottle of vitamins chewed packaging", "URGENT"),
    ("cat hissing growling hiding since returning from vet visit", "SAFE"),
    ("dog has rash on belly appeared after walk in bushes", "MONITOR"),
    ("cat vocalizing loudly at night every night for past week", "MONITOR"),
    ("dog seizure nervous system problems teeth chattering falling down", "CRITICAL"),
    ("cat ingested ibuprofen one tablet was found chewed open", "CRITICAL"),
    ("puppy has not had bowel movement for 3 days straining", "URGENT"),
    ("dog eye swollen almost completely shut after scratch from cat", "URGENT"),
    ("cat has developed sudden hind limb paralysis", "CRITICAL"),
    ("dog whimpering when breathing in sounds like it hurts to breathe", "URGENT"),
    ("rabbit loud tooth grinding cecal impaction suspected", "URGENT"),
    ("dog ate bird that may have been poisoned", "URGENT"),
    ("cat fell from 3rd floor walking strangely now holding one leg up", "URGENT"),
    ("senior cat drooling not eating teeth chattering", "URGENT"),
    ("dog has persistent cough with mucus has been going on two weeks", "MONITOR"),
    ("cat ate tinsel from christmas tree small amount", "URGENT"),
    ("dog with diabetes collapsed after unusual amount of exercise", "CRITICAL"),
    ("cat has open drainage wound on neck from abscess", "URGENT"),
    ("rabbit laid completely flat stretched out eyes half closed not eating", "CRITICAL"),
    ("puppy ate socks might be blocking intestines vomiting repeatedly", "URGENT"),
    ("dog is coughing blood bright red blood only a small amount", "URGENT"),
    ("cat resting comfortably but has not eaten for 36 hours no other symptoms", "MONITOR"),
    ("dog ingested large amount of marijuana accidentally", "URGENT"),
    ("cat bit by another cat two days ago swollen limb infection spreading", "URGENT"),
    ("dog is scratching at its ear so hard it is causing bleeding", "MONITOR"),
    ("puppy vomiting yellow bile in morning but fine rest of day", "SAFE"),
    ("cat breathing open mouthed while resting not after exercise", "CRITICAL"),
    ("dog has foreign body stuck in paw limping whimpering", "URGENT"),
    ("rabbit overheated in sun cage, panting lying stretched out", "CRITICAL"),
]


import random

SYNONYMS = {
    'dog ': ['dog ', 'puppy ', 'hound ', 'canine ', 'my dog ', 'older dog ', 'senior dog '],
    'cat ': ['cat ', 'kitten ', 'feline ', 'my cat ', 'senior cat '],
    'rabbit ': ['rabbit ', 'bunny ', 'my rabbit '],
    'eating': ['eating', 'feeding', 'consuming food'],
    'drinking': ['drinking', 'sipping water', 'consuming liquids'],
    'sleeping': ['sleeping', 'resting', 'napping'],
    'playing': ['playing', 'running around', 'active'],
    'vomited': ['vomited', 'threw up', 'puked'],
    'vomiting': ['vomiting', 'throwing up', 'puking'],
    'diarrhea': ['diarrhea', 'loose stool', 'watery stool'],
    'lethargic': ['lethargic', 'tired', 'sluggish', 'exhausted', 'unresponsive'],
    'blood': ['blood', 'red blood', 'bloody discharge'],
    'pain': ['pain', 'discomfort', 'agony', 'suffering'],
    'breathing': ['breathing', 'panting', 'respiration'],
    'normal': ['normal', 'fine', 'okay', 'good'],
    'water': ['water', 'fluids'],
    'food': ['food', 'meals', 'kibble', 'wet food'],
    'vet': ['vet', 'veterinarian', 'doctor'],
}

def augment_text(text: str) -> str:
    res = text
    for k, v in SYNONYMS.items():
        if k in res:
            if random.random() < 0.6:
                res = res.replace(k, random.choice(v))
    return res

def get_dataset() -> Tuple[List[str], List[str]]:
    """Returns (texts, labels) augmented dynamically for robust ML training."""
    augmented_set = set()
    
    # Original 200 samples
    for text, label in SYMPTOM_DATASET:
        augmented_set.add((text, label))
        
        # Augment heavily to create data density for deep models (reaches ~3000+ samples)
        for _ in range(80):
            aug = augment_text(text)
            augmented_set.add((aug, label))
            
    texts = [s[0] for s in augmented_set]
    labels = [s[1] for s in augmented_set]
    
    # Shuffle predictably to mix classes evenly
    combined = list(zip(texts, labels))
    random.seed(42)
    random.shuffle(combined)
    
    return [c[0] for c in combined], [c[1] for c in combined]
