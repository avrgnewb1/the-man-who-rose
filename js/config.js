// Swap art/audio here as it lands. Paths are relative to engine/index.html.
// Mappings are id -> filename; dirs below. Sprites default to sprites/<char>/<expr>.png (see EXPR_MOOD fallback).
window.ASSETS = {
  // All art/audio resolves as dirs[kind] + filename. Mappings below are id -> filename only; rename here if artists rename.
  dirs: { bg: "assets/bg/", cg: "assets/cg/", sprites: "assets/sprites/", music: "assets/music/", sfx: "assets/sfx/" },
  preferVersion: { cg: 3 },             // Robert final-build: pin Theo's _v3 CGs/key art; remove to use newest _vN
  styleMaster: null,
  bg: { // draft bg_id -> Atlas file in art/bg (Robert's alias map, Oct 12 23:34). An exact bg_<draftid>.* always wins.
    brick_house_porch_dusk: "bg_porch_storm_dusk.png",
    brick_house_kitchen_morning: "bg_house_kitchen_morning.png",
    brick_house_living_room: "bg_house_living_room_day.png",
    brick_house_side_yard_morning: "bg_dirt_pile_yard_day.png",     // + time-of-day tints
    uncle_fred_house: "bg_fred_house_front_day.png",
    uncle_fred_house_day: "bg_fred_house_front_day.png",
    car_interior_dusk: "bg_car_interior_dusk.png",
    // exact files now used (Atlas, 23:35): bg_brick_house_living_room_dusk, _side_yard_noon/_afternoon/_sunset, bg_burger_place_booth,
    // bg_car_interior_day, bg_uncle_fred_house_backyard_afternoon. bg_desert_highway_dusk is NOT car_interior_day.
  },
  bgTint: { // CSS overlay applied over mapped/stand-in bgs (not over an exact bg_<draftid> file)
    brick_house_side_yard_morning: "linear-gradient(rgba(255,225,170,.18),rgba(160,190,220,.12))",
  },
  bgFallbackDir: "",         // tries <dir><id>.jpg / .png / .webp before placeholder
  sprites: {
    // optional per-char override: id -> "<subdir>/{expr}.png"; default is sprites/<char>/<expr>.png
  },
  music: {},                            // tracks resolve as dirs.music + <id>.ogg (see MUSIC)
  sfx: { // Echo Ch1 pack -> scene cue slugs (Robert, 2026-10-13 07:42 MT)
    "distant_thunder_low_wind_in_dry_grass": "thunder_distant_low_01.ogg",
    "first_fat_raindrops_on_the_roof": "rain_first_drops_roof_01.ogg",
    "thunder_closer": "thunder_closer_01.ogg",
    "thunder_crack_porch_light_flickers": "thunder_crack_01.ogg",
    "rain_heavy_steady": "rain_heavy_steady_loop.ogg",
    "thunder_far_away_now_dripping_eaves": "thunder_far_away_01.ogg",
    "cereal_bowls_clinking_a_school_bus_brake_hissing_far_off": "cereal_bowls_clink_01.ogg",
    "front_door_closing_car_pulling_away": "front_door_close_01.ogg",
    "old_tv_clicking_on_soft_static_hum": "tv_crt_click_on_01.ogg",
    "a_whistled_easygoing_tv_theme_original_no_real_show_or_lyric": "tv_theme_whistle_loop.ogg",
    "engine_windows_down_wind": "car_dusk_two_lane_loop.ogg",
    "bike_tires_on_gravel_cartoon_noises_game_blips_giggling": "bike_tires_gravel_01.ogg",
    "muffled_laughter_from_the_kitchen_grandpa_and_fred": "muffled_laughter_kitchen_01.ogg",
    "fryer_sizzle_register_beeps_soda_fountain": "register_beeps_01.ogg",
    "crickets_a_car_door_mom_s_car_pulling_in": "car_door_close_01.ogg",
    "birds_a_shovel_biting_into_dirt": "shovel_dig_01.ogg",
    "bike_bells_tires_on_gravel": "bike_tires_gravel_01.ogg",
    "tires_thump_whoops_dirt_spraying": "bike_jump_land_01.ogg",
    "thud_small_crash": "bike_crash_small_01.ogg",
    "whoosh_tires_leave_dirt": "bike_whoosh_off_ramp_01.ogg",
    "thump_skid": "bike_thump_skid_01.ogg",
    "skateboard_wheels_on_the_street_rolling_past": "skateboard_roll_past_01.ogg",
    "a_bigger_bike_skids_up": "bike_skid_big_01.ogg",
    "tires_cheering": "bike_jump_land_01.ogg",
    "crickets_starting_bike_wheels_ticking": "crickets_starting_01.ogg",
    "thud_everybody_laughing_again": "bike_crash_small_01.ogg",
    "engine_hum_tires_on_freeway_seams_windows_cracked": "car_freeway_seams_loop.ogg",
    "freeway_traffic_a_steady_rush_behind_the_house_sprinkler_tic": "freeway_rush_behind_house_loop.ogg",
    "freeway_rush_screen_door_laughter": "screen_door_open_slap_01.ogg",
    "engine_hum_tires_on_freeway_seams": "car_freeway_seams_loop.ogg",
  },
  autoProbe: false,                     // backgrounds: explicit map above only
  probeSprites: true,                   // art/sprites/<char>/<expr>.png, <char>/<char>_<expr>.png, <char>.png
  probeSfx: true, // audio/sfx/<cue>.ogg|.wav|.mp3; caption always shown as fallback                      // probe fallback dirs (no network; local files only)
};
// Flags exactly per flag-map.md (Nova). Keyed by scene id -> option key.
window.FLAG_MAP = {
  porch:    { A: { lets_in_grandpa: 1 }, B: { masks_with_jokes: 1 } },
  stayhome: { A: { lets_in_grandpa: 1 }, B: { masks_with_jokes: 1 } },
  dirtpile: { A: { carries_it_for_others: 1 }, B: {} },
  boulders: { A: { lets_in_grandpa: 1 }, B: { fred_bond: 1 }, C: { carries_it_for_others: 1 } },
};
window.FLAGS_INIT = { lets_in_grandpa: 0, masks_with_jokes: 0, fred_bond: 0, carries_it_for_others: 0 };
// Speaker label -> sprite character id (to dim non-speakers)
window.SPEAKER_SPRITE = { AZRIEL: "azriel", GRANDPA: "grandpa_eddie", MOM: "mom", "UNCLE FRED": "uncle_fred",
  ZEKE: "zeke", NEIL: "neil", LACY: "lacy", DEVIN: "devin", MICHAEL: "michael", "BIG KID": "big_kid", VIC: "vic", DAD: "dad" };
window.CHAR_COLORS = { azriel: "#d98c4a", grandpa_eddie: "#a8423a", mom: "#7a6ab0", uncle_fred: "#4a7ea8", zeke: "#5aa06a",
  neil: "#c4a640", lacy: "#c0608a", devin: "#b0663a", michael: "#3a8a8a", big_kid: "#777", vic: "#555", dad: "#8a7a5a" };
// UI copy from ../ui-copy.md (Sage, Oct 12). Tagline approved by Charlie: "Before he rose, he had to fall."
window.UI_COPY = {
  title: "The Man Who Rose", tagline: "Before he rose, he had to fall.",
  menu: { begin: "Begin", cont: "Continue", settings: "Settings" },
  chapter: { num: "Chapter 1", title: "Desert Light", meta: "New Mexico · 2002 · Age 5", oneLine: "Chapter 1 — Desert Light" },
  choicePrompt: "",
  names: { NARRATION: "", GRANDPA: "Grandpa", MOM: "Ama", AZRIEL: "Azriel", "UNCLE FRED": "Uncle Fred", ZEKE: "Zeke",
    NEIL: "Neil", LACY: "Lacy", DEVIN: "Devin", MICHAEL: "Michael", "BIG KID": "Big Kid", VIC: "Vic", DAD: "Dad" },
  // exact choice texts from ui-copy.md; engine uses these (checked against drafts by build_scenes.py)
  choices: {
    porch: { A: "Scoot closer to Grandpa and grab his flannel sleeve.", B: "Laugh it off loud: \"That's not even scary!\"" },
    stayhome: { A: "Climb up and sit on the arm of Grandpa's chair.", B: "Do a goofy whistle until he laughs and forgets." },
    dirtpile: { A: "Step in front of Neil. \"Hey. Let's just show him the ramp.\"", B: "Stand right next to Neil, shoulder to shoulder." },
    boulders: { A: "\"They're Grandpa's!\"", B: "\"They're Uncle Fred's. They're in his yard.\"", C: "\"You should share. One each. Forever.\"" },
  },
};

// ---- Pass 3 (Robert, Oct 12): Theo's v2 CGs + Lyra's music ----
window.ASSETS.titleArt = "title_keyart"; // file in dirs.cg
// CG file = versioned base name (no extension): engine picks newest <base>_vN.<ext> from art/cg (falls back to <base>.<ext>).
// CG moments: shown from the line containing `show` until the line containing `hide` (or scene end).
// src null = file missing; the moment is skipped (no placeholder invented).
window.CGS = [
  { id: "porch_donkey_story_storm", scene: "porch", file: "cg_ch1_porch_donkey_story_storm",
    show: "Alright. There were some children who lived near a forest.", hide: "Then he went quiet, watching the rain" },
  { id: "stay_home_day", scene: "stayhome", file: "cg_ch1_stay_home_day",
    show: ["Up you go. Careful, my old bones.", "[whistling, totally off-key]"], hide: "Let's go see my brother." },
  { id: "dirt_pile_day", scene: "dirtpile", file: "cg_ch1_dirt_pile_day",
    show: "For one second, I was higher than the fence.", hide: "Out on the street, Vic rolled by" },
  { id: "boulders_rock_war", scene: "boulders", file: "cg_ch1_boulder_rock_war",
    show: "The rest of the day, Zeke and I ran the yard barefoot.", hide: "Good day, Bear?" },
  { id: "car_asleep_dusk", scene: "boulders", file: "cg_ch1_car_asleep_dusk",
    show: "The road hummed. The sky went orange, then pink.", hide: null },
];
// Music (audio/music/MUSIC_PLAN.md). OGG via Web Audio buffer loop (gapless); MP3 fallback if OGG can't decode.
window.MUSIC = {
  crossfade: 2.0, stopFade: 3.0, volume: 0.7,
  tracks: ["title_theme_loop", "summer_family_theme_loop", "playful_siblings_theme_loop", "dusk_drive_home_boulders_loop"],
  title: "title_theme_loop",           // title/menu + chapter card
  sceneStart: { stayhome: "playful_siblings_theme_loop" }, // scenes with no [MUSIC:] tag
  // [MUSIC: ...] tags in order of appearance per scene (null = fade out)
  tags: {
    porch: [null],                                         // "none — ambience only" (no storm music)
    dirtpile: ["playful_siblings_theme_loop", "summer_family_theme_loop"], // "light, bouncy acoustic", "warm, slower"
    boulders: ["summer_family_theme_loop", "dusk_drive_home_boulders_loop"], // "easy, sunny acoustic", "soft, warm"
  },
};

// Sprite resolution: <char>/<expr>.png -> <char>/<char>_<expr>.png -> <char>/<mood>.png -> <char>/neutral.png -> silhouette.
// Mira's current sets are happy/neutral/sad; map draft expressions to those moods.
window.EXPR_MOOD = {
  happy: ["grin","eyes_closed_happy","masked_smile","scared_but_grinning","amazed","huge_grin","smile","smile_tired","laughing","content",
          "proud_shovel","amused_shovel","hand_on_boulder","warm_smile","lion_grin","dreamy","tiny_smile","fired_up","airborne","cool_nod","smirk","asleep_smiling","busy"],
  sad: ["distant","worried","pouty","red_face","unconvinced_soft"],
};
// Characters every build must define (Dad required even though Ch1 drafts don't use him yet).
window.REQUIRED_SPRITES = ["azriel","grandpa_eddie","mom","dad","uncle_fred","zeke","neil","lacy","devin","michael","big_kid","vic"];
