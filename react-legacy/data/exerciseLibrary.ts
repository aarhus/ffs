
export interface ExerciseInfo {
  id: string;
  name: string;
  category?: string;
  instructions?: string;
  videoLink?: string;
  equipment?: 'none' | 'minimal' | 'gym';
  muscleGroup?: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Abs' | 'Full Body' | 'Cardio' | 'Other';
}

export const exerciseLibrary: ExerciseInfo[] = [
  // A
  { id: 'ab_wheel_rollout', name: 'Ab Wheel Rollout', category: 'Weighted Support', instructions: 'Kneel on the floor and hold the ab wheel handles. Roll forward, keeping your back straight, until you feel a stretch in your abs. Roll back to the starting position.', videoLink: 'https://www.youtube.com/watch?v=rqiTPdK1c_I', equipment: 'minimal', muscleGroup: 'Abs' },
  { id: 'air_bike', name: 'Air Bike', instructions: 'Sit on the bike and place feet on pedals and hands on handles. Pedal and push/pull with your arms simultaneously. Maintain a steady pace for cardio.', videoLink: 'https://www.youtube.com/watch?v=S0Yp2Vv0G_4', equipment: 'gym', muscleGroup: 'Cardio' },
  { id: 'archer_pull_ups', name: 'Archer Pull Ups', category: 'Weighted Support', instructions: 'Pull up towards one hand, keeping the other arm straight out to the side, like drawing a bow. Alternate sides.', videoLink: 'https://www.youtube.com/watch?v=MwdPa4a4vjQ', equipment: 'minimal', muscleGroup: 'Back' },
  { id: 'archer_push_ups', name: 'Archer Push Ups', category: 'Weighted Support', instructions: 'Perform a push-up while extending one arm out to the side. Keep the extended arm straight. Alternate sides.', videoLink: 'https://www.youtube.com/watch?v=VL5uhtL_T3o', equipment: 'none', muscleGroup: 'Chest' },
  { id: 'arnold_press', name: 'Arnold Press', instructions: 'Start with dumbbells in front of your shoulders, palms facing you. Press up while rotating your palms to face forward at the top.', videoLink: 'https://www.youtube.com/watch?v=6Z15_WdXmVw', equipment: 'minimal', muscleGroup: 'Shoulders' },

  // B
  { id: 'back_extension', name: 'Back Extension', category: 'Weighted Support', instructions: 'Using a back extension machine, lower your upper body until you feel a stretch in your hamstrings, then raise back up by squeezing your glutes and lower back.', videoLink: 'https://www.youtube.com/watch?v=ph3pddRMeSQ', equipment: 'gym', muscleGroup: 'Back' },
  { id: 'band_assisted_pull_ups', name: 'Band Assisted Pull Ups', instructions: 'Loop a resistance band around the pull-up bar and your foot/knee to assist with the upward phase of the pull-up.', videoLink: 'https://www.youtube.com/watch?v=PFJgMA1yEak', equipment: 'minimal', muscleGroup: 'Back' },
  { id: 'barbell_calf_raise', name: 'Barbell Calf Raise', instructions: 'Stand with a barbell on your upper back. Raise your heels as high as possible, squeezing your calves at the top. Lower slowly.', videoLink: 'https://www.youtube.com/watch?v=3uVuOFL1C7M', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'barbell_curl', name: 'Barbell Curl', instructions: 'Stand holding a barbell with an underhand grip. Curl the barbell up towards your shoulders, keeping your elbows stationary.', videoLink: 'https://www.youtube.com/watch?v=kwG2ipFRgfo', equipment: 'gym', muscleGroup: 'Biceps' },
  { id: 'barbell_front_raise', name: 'Barbell Front Raise', instructions: 'Hold a barbell with an overhand grip. Lift the barbell straight out in front of you to shoulder height, keeping your arms straight.', videoLink: 'https://www.youtube.com/watch?v=sxe_PEkvN_A', equipment: 'gym', muscleGroup: 'Shoulders' },
  { id: 'barbell_glute_bridge', name: 'Barbell Glute Bridge', instructions: 'Lie on your back with knees bent. Place a padded barbell across your hips. Drive your hips up by squeezing your glutes.', videoLink: 'https://www.youtube.com/watch?v=B-4_h1I-b_0', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'barbell_hack_squat', name: 'Barbell Hack Squat', instructions: 'Stand with a barbell behind your legs. Squat down to grab the bar, then stand up, keeping the bar close to your body.', videoLink: 'https://www.youtube.com/watch?v=mGq_rK-y76A', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'barbell_lunge', name: 'Barbell Lunge', instructions: 'Place a barbell on your upper back. Step forward with one leg and lower your hips until both knees are bent at a 90-degree angle.', videoLink: 'https://www.youtube.com/watch?v=wr6_SA7h-a0', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'barbell_pullover', name: 'Barbell Pullover', instructions: 'Lie on a bench with a barbell held over your chest. Lower the barbell behind your head, keeping a slight bend in your elbows.', videoLink: 'https://www.youtube.com/watch?v=tpso3_2v32w', equipment: 'gym', muscleGroup: 'Chest' },
  { id: 'barbell_shrug', name: 'Barbell Shrug', instructions: 'Hold a heavy barbell in front of you. Shrug your shoulders straight up towards your ears. Avoid rolling your shoulders.', videoLink: 'https://www.youtube.com/watch?v=NAqCVe2mwzM', equipment: 'gym', muscleGroup: 'Back' },
  { id: 'battle_ropes', name: 'Battle Ropes', instructions: 'Hold one end of the rope in each hand. Create waves, slams, or circles for a high-intensity workout.', videoLink: 'https://www.youtube.com/watch?v=hGJoAsnaxzM', equipment: 'minimal', muscleGroup: 'Full Body' },
  { id: 'bench_dips', name: 'Bench Dips', category: 'Weighted Support', instructions: 'Place your hands on a bench behind you and feet on the floor. Lower your body until your elbows are at 90 degrees, then press up.', videoLink: 'https://www.youtube.com/watch?v=c3ZGl4pAwZ4', equipment: 'minimal', muscleGroup: 'Triceps' },
  { id: 'bench_press', name: 'Bench Press', instructions: 'Lie on a bench, lower a barbell to your mid-chest, and press it back up until your arms are fully extended.', videoLink: 'https://www.youtube.com/watch?v=rT7DgCr-3pg', equipment: 'gym', muscleGroup: 'Chest' },
  { id: 'bent_over_row', name: 'Bent Over Row', instructions: 'Hinge at your hips with a flat back, holding a barbell. Row the barbell up to your lower chest.', videoLink: 'https://www.youtube.com/watch?v=vT2GjY_Umpw', equipment: 'gym', muscleGroup: 'Back' },
  { id: 'bicycle_crunch', name: 'Bicycle Crunch', category: 'Weighted Support', instructions: 'Lie on your back and bring opposite knee to opposite elbow in a cycling motion.', videoLink: 'https://www.youtube.com/watch?v=Iwyvozckjak', equipment: 'none', muscleGroup: 'Abs' },
  { id: 'bird_dog', name: 'Bird Dog', category: 'Weighted Support', instructions: 'On all fours, extend your opposite arm and leg simultaneously, keeping your core tight and back flat.', videoLink: 'https://www.youtube.com/watch?v=wiFNA3sqjCA', equipment: 'none', muscleGroup: 'Abs' },
  { id: 'bodyweight_squat', name: 'Bodyweight Squat', category: 'Weighted Support', instructions: 'Stand with feet shoulder-width apart. Lower your hips as if sitting in a chair, keeping your chest up and back straight.', videoLink: 'https://www.youtube.com/watch?v=C_VtOYc6j5c', equipment: 'none', muscleGroup: 'Legs' },
  { id: 'box_jump', name: 'Box Jump', category: 'Weighted Support', instructions: 'Jump explosively from the floor onto a sturdy box, landing softly.', videoLink: 'https://www.youtube.com/watch?v=52r_Ul5k03g', equipment: 'minimal', muscleGroup: 'Legs' },
  { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', instructions: 'Place the top of one foot on a bench behind you. Lower your hips until your front thigh is parallel to the floor.', videoLink: 'https://www.youtube.com/watch?v=2C-uNgKwPLE', equipment: 'minimal', muscleGroup: 'Legs' },
  { id: 'burpees', name: 'Burpees', category: 'Weighted Support', instructions: 'A full-body exercise involving a squat, push-up, and jump.', videoLink: 'https://www.youtube.com/watch?v=dZgVxmf6jkA', equipment: 'none', muscleGroup: 'Full Body' },

  // C
  { id: 'cable_bicep_curl', name: 'Cable Bicep Curl', instructions: 'Use a low cable pulley with a bar attachment. Curl the bar up, keeping your elbows at your sides.', videoLink: 'https://www.youtube.com/watch?v=K1S-k9g2zsw', equipment: 'gym', muscleGroup: 'Biceps' },
  { id: 'cable_chest_press', name: 'Cable Chest Press', instructions: 'Stand between two cable pulleys set at chest height. Press the handles forward, squeezing your chest.', videoLink: 'https://www.youtube.com/watch?v=rMMs_wbS_eI', equipment: 'gym', muscleGroup: 'Chest' },
  { id: 'cable_crunch', name: 'Cable Crunch', instructions: 'Kneel in front of a high pulley with a rope attachment. Hold the rope by your head and crunch down, bringing your elbows towards your knees.', videoLink: 'https://www.youtube.com/watch?v=vM2-Gk7tq10', equipment: 'gym', muscleGroup: 'Abs' },
  { id: 'cable_fly', name: 'Cable Fly', instructions: 'Stand between two cable pulleys. With a slight bend in your elbows, bring the handles together in front of your chest.', videoLink: 'https://www.youtube.com/watch?v=Iwe6AmxVf7o', equipment: 'gym', muscleGroup: 'Chest' },
  { id: 'cable_kickback', name: 'Cable Kickback', instructions: 'Use a low cable pulley with an ankle strap. Kick your leg straight back, squeezing your glute.', videoLink: 'https://www.youtube.com/watch?v=BE2jw-2C0gY', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'cable_lateral_raise', name: 'Cable Lateral Raise', instructions: 'Use a low cable pulley. Raise your arm out to the side up to shoulder height.', videoLink: 'https://www.youtube.com/watch?v=p1F324Q92VI', equipment: 'gym', muscleGroup: 'Shoulders' },
  { id: 'cable_overhead_tricep_extension', name: 'Cable Overhead Tricep Extension', instructions: 'Face away from a high pulley with a rope. Extend your arms fully overhead.', videoLink: 'https://www.youtube.com/watch?v=35436c1JcNc', equipment: 'gym', muscleGroup: 'Triceps' },
  { id: 'cable_pull_through', name: 'Cable Pull Through', instructions: 'Face away from a low cable pulley. Hinge at the hips and pull the rope through your legs as you stand up, squeezing your glutes.', videoLink: 'https://www.youtube.com/watch?v=MG7lnb-tW84', equipment: 'gym', muscleGroup: 'Legs' },
  { id: "captains_chair_leg_raise", name: "Captain's Chair Leg Raise", category: "Weighted Support", instructions: 'Support yourself on a captain\'s chair. Raise your straight legs as high as you can.', videoLink: 'https://www.youtube.com/watch?v=LpL62qZPXaA', equipment: 'gym', muscleGroup: 'Abs' },
  { id: 'chest_supported_dumbbell_row', name: 'Chest Supported Dumbbell Row', instructions: 'Lie face down on an incline bench. Row dumbbells up, squeezing your back.', videoLink: 'https://www.youtube.com/watch?v=4 TcmaPcf-6A', equipment: 'minimal', muscleGroup: 'Back' },
  { id: 'chin_ups', name: 'Chin Ups', category: 'Weighted Support', instructions: 'Hang from a bar with an underhand grip. Pull your chest up to the bar.', videoLink: 'https://www.youtube.com/watch?v=b-2c33t6-10', equipment: 'minimal', muscleGroup: 'Back' },
  { id: 'clean_and_jerk', name: 'Clean and Jerk', instructions: 'An Olympic lift. Perform a clean, then explosively press the barbell overhead by dipping and driving with your legs.', videoLink: 'https://www.youtube.com/watch?v=8910-i0Z0iY', equipment: 'gym', muscleGroup: 'Full Body' },
  { id: 'close_grip_bench_press', name: 'Close Grip Bench Press', instructions: 'Perform a bench press with a narrower grip to emphasize the triceps.', videoLink: 'https://www.youtube.com/watch?v=cXbSJ2-tD4g', equipment: 'gym', muscleGroup: 'Triceps' },
  { id: 'close_grip_lat_pulldown', name: 'Close Grip Lat Pulldown', instructions: 'Use a lat pulldown machine with a close grip attachment.', videoLink: 'https://www.youtube.com/watch?v=uAyrz5Gtn2c', equipment: 'gym', muscleGroup: 'Back' },
  { id: 'crunches', name: 'Crunches', category: 'Weighted Support', instructions: 'Lie on your back and lift your upper back off the floor to contract your abs.', videoLink: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU', equipment: 'none', muscleGroup: 'Abs' },
  { id: 'cycling', name: 'Cycling', instructions: 'Riding a bicycle, either stationary or outdoors.', videoLink: '', equipment: 'minimal', muscleGroup: 'Cardio' },

  // D
  { id: 'dead_hang', name: 'Dead Hang', instructions: 'Hang from a pull-up bar with a relaxed, passive grip to improve grip strength and decompress the spine.', videoLink: 'https://www.youtube.com/watch?v=5a_2K2S_Ipc', equipment: 'minimal', muscleGroup: 'Back' },
  { id: 'deadlift', name: 'Deadlift', instructions: 'Lift a loaded barbell off the floor until you are standing upright, keeping your back straight.', videoLink: 'https://www.youtube.com/watch?v=wjsUf0TMkhk', equipment: 'gym', muscleGroup: 'Full Body' },
  { id: 'decline_bench_press', name: 'Decline Bench Press', instructions: 'Perform a bench press on a decline bench to target the lower chest.', videoLink: 'https://www.youtube.com/watch?v=LfyQBUKR8s4', equipment: 'gym', muscleGroup: 'Chest' },
  { id: 'decline_push_up', name: 'Decline Push Up', category: 'Weighted Support', instructions: 'Perform a push-up with your feet elevated to increase the difficulty and target the upper chest.', videoLink: 'https://www.youtube.com/watch?v=Sk5Po2c3y0k', equipment: 'none', muscleGroup: 'Chest' },
  { id: 'diamond_push_ups', name: 'Diamond Push Ups', category: 'Weighted Support', instructions: 'Perform a push-up with your hands together, forming a diamond shape, to heavily target the triceps.', videoLink: 'https://www.youtube.com/watch?v=J0D-SwLojOE', equipment: 'none', muscleGroup: 'Triceps' },
  { id: 'dips', name: 'Dips', category: 'Weighted Support', instructions: 'Using parallel bars, lower your body until your shoulders are below your elbows, then press back up.', videoLink: 'https://www.youtube.com/watch?v=2z8JmcrW-As', equipment: 'minimal', muscleGroup: 'Triceps' },
  { id: 'dragon_flag', name: 'Dragon Flag', category: 'Weighted Support', instructions: 'An advanced core exercise where you lower your entire body from a vertical position, keeping it straight.', videoLink: 'https://www.youtube.com/watch?v=mj9g_x--u6Q', equipment: 'none', muscleGroup: 'Abs' },
  { id: 'dumbbell_bench_press', name: 'Dumbbell Bench Press', instructions: 'Lie on a bench and press two dumbbells up over your chest.', videoLink: 'https://www.youtube.com/watch?v=VmB1G1K7v94', equipment: 'minimal', muscleGroup: 'Chest' },
  { id: 'dumbbell_curl', name: 'Dumbbell Curl', instructions: 'Stand or sit, and curl dumbbells towards your shoulders.', videoLink: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo', equipment: 'minimal', muscleGroup: 'Biceps' },
  { id: 'dumbbell_fly', name: 'Dumbbell Fly', instructions: 'Lie on a bench with dumbbells over your chest. Lower them out to your sides with a slight bend in your elbows.', videoLink: 'https://www.youtube.com/watch?v=eozb-ti_pvk', equipment: 'minimal', muscleGroup: 'Chest' },
  { id: 'dumbbell_front_raise', name: 'Dumbbell Front Raise', instructions: 'Lift dumbbells straight up in front of you to shoulder height.', videoLink: 'https://www.youtube.com/watch?v=s_L1L7aL-js', equipment: 'minimal', muscleGroup: 'Shoulders' },
  { id: 'dumbbell_lateral_raise', name: 'Dumbbell Lateral Raise', instructions: 'Raise dumbbells out to your sides up to shoulder height, with a slight bend in your elbows.', videoLink: 'https://www.youtube.com/watch?v=3VcKaXpzqRo', equipment: 'minimal', muscleGroup: 'Shoulders' },
  { id: 'dumbbell_lunge', name: 'Dumbbell Lunge', instructions: 'Hold dumbbells at your sides and perform lunges.', videoLink: 'https://www.youtube.com/watch?v=D7KaRcUTQeE', equipment: 'minimal', muscleGroup: 'Legs' },
  { id: 'dumbbell_pullover', name: 'Dumbbell Pullover', instructions: 'Lie on a bench and lower a single dumbbell held in both hands behind your head.', videoLink: 'https://www.youtube.com/watch?v=Ydpy886_3wk', equipment: 'minimal', muscleGroup: 'Chest' },
  { id: 'dumbbell_romanian_deadlift', name: 'Dumbbell Romanian Deadlift', instructions: 'Hold dumbbells in front of your thighs. Hinge at the hips with a straight back, lowering the weights until you feel a stretch in your hamstrings.', videoLink: 'https://www.youtube.com/watch?v=FQKe8E2von0', equipment: 'minimal', muscleGroup: 'Legs' },
  { id: 'dumbbell_row', name: 'Dumbbell Row', instructions: 'Support yourself with one hand on a bench. Row a dumbbell up to your side, keeping your back straight.', videoLink: 'https://www.youtube.com/watch?v=pYcpY20QaE8', equipment: 'minimal', muscleGroup: 'Back' },
  { id: 'dumbbell_shoulder_press', name: 'Dumbbell Shoulder Press', instructions: 'Sit or stand and press dumbbells overhead until your arms are fully extended.', videoLink: 'https://www.youtube.com/watch?v=qEwKCR5JCog', equipment: 'minimal', muscleGroup: 'Shoulders' },
  { id: 'dumbbell_shrug', name: 'Dumbbell Shrug', instructions: 'Hold heavy dumbbells at your sides and shrug your shoulders up.', videoLink: 'https://www.youtube.com/watch?v=I-hS-Msrfkw', equipment: 'minimal', muscleGroup: 'Back' },
  { id: 'dumbbell_tricep_kickback', name: 'Dumbbell Tricep Kickback', instructions: 'Hinge forward with a flat back. Extend your arm straight back by contracting your tricep.', videoLink: 'https://www.youtube.com/watch?v=6SS6K3lAwZ8', equipment: 'minimal', muscleGroup: 'Triceps' },

  // E
  { id: 'elliptical_trainer', name: 'Elliptical Trainer', instructions: 'Use an elliptical machine for a low-impact cardiovascular workout.', videoLink: '', equipment: 'gym', muscleGroup: 'Cardio' },
  { id: 'ez_bar_curl', name: 'EZ Bar Curl', instructions: 'Use an EZ curl bar for bicep curls, which can be more comfortable on the wrists than a straight bar.', videoLink: 'https://www.youtube.com/watch?v=ioR5Pkc2o68', equipment: 'gym', muscleGroup: 'Biceps' },
  { id: 'ez_bar_lying_tricep_extension', name: 'EZ Bar Lying Tricep Extension', instructions: 'Also known as skullcrushers. Lie on a bench and lower an EZ bar towards your forehead, then extend your arms.', videoLink: 'https://www.youtube.com/watch?v=d_KZxkY_0cM', equipment: 'gym', muscleGroup: 'Triceps' },

  // F
  { id: 'face_pull', name: 'Face Pull', instructions: 'Use a rope attachment on a high cable pulley. Pull the ropes towards your face while externally rotating your shoulders.', videoLink: 'https://www.youtube.com/watch?v=V8dZ3pyiCBo', equipment: 'gym', muscleGroup: 'Shoulders' },
  { id: 'farmers_walk', name: "Farmer's Walk", instructions: 'Hold a heavy dumbbell or kettlebell in each hand and walk for a set distance or time.', videoLink: 'https://www.youtube.com/watch?v=Fkzk_RqlYig', equipment: 'minimal', muscleGroup: 'Full Body' },
  { id: 'front_squat', name: 'Front Squat', instructions: 'Hold a barbell in a front rack position across your shoulders. Squat down, keeping your torso upright.', videoLink: 'https://www.youtube.com/watch?v=v-mQm_b1unU', equipment: 'gym', muscleGroup: 'Legs' },

  // G
  { id: 'glute_bridge', name: 'Glute Bridge', category: 'Weighted Support', instructions: 'Lie on your back with knees bent. Squeeze your glutes to lift your hips off the floor until your body forms a straight line from shoulders to knees.', videoLink: 'https://www.youtube.com/watch?v=wPM8icPu6H8', equipment: 'none', muscleGroup: 'Legs' },
  { id: 'glute_ham_raise', name: 'Glute Ham Raise', instructions: 'Using a GHD machine, lower your torso towards the floor, then raise it back up by contracting your hamstrings and glutes.', videoLink: 'https://www.youtube.com/watch?v=l_K4v9-4ySU', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'goblet_squat', name: 'Goblet Squat', instructions: 'Hold one dumbbell or kettlebell vertically against your chest. Squat down, keeping your chest up and back straight.', videoLink: 'https://www.youtube.com/watch?v=MeW1b-zsmvk', equipment: 'minimal', muscleGroup: 'Legs' },
  { id: 'good_morning', name: 'Good Morning', instructions: 'With a barbell on your back, hinge at the hips, keeping your back straight and a slight bend in your knees. Lower your torso until it is almost parallel to the floor.', videoLink: 'https://www.youtube.com/watch?v=M-8F2t-Jc4I', equipment: 'gym', muscleGroup: 'Legs' },

  // H
  { id: 'hack_squat', name: 'Hack Squat', instructions: 'Using a hack squat machine, position your shoulders and back against the pads. Squat down by bending your knees.', videoLink: 'https://www.youtube.com/watch?v=0tn5L9BOI8I', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'hammer_curl', name: 'Hammer Curl', instructions: 'Perform a dumbbell curl with a neutral (hammer) grip to target the brachialis and forearms.', videoLink: 'https://www.youtube.com/watch?v=zC3nLlEvin4', equipment: 'minimal', muscleGroup: 'Biceps' },
  { id: 'handstand_push_ups', name: 'Handstand Push Ups', category: 'Weighted Support', instructions: 'In a handstand position (against a wall for support), lower your head towards the floor and press back up.', videoLink: 'https://www.youtube.com/watch?v=3-TJY26W2kE', equipment: 'none', muscleGroup: 'Shoulders' },
  { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', category: 'Weighted Support', instructions: 'Hang from a bar and raise your straight legs as high as possible.', videoLink: 'https://www.youtube.com/watch?v=Pr1ieGZ5atk', equipment: 'minimal', muscleGroup: 'Abs' },
  { id: 'hex_bar_deadlift', name: 'Hex Bar Deadlift', instructions: 'Perform a deadlift using a hex (or trap) bar, which allows for a more upright posture.', videoLink: 'https://www.youtube.com/watch?v=B8_2pI-Xp8s', equipment: 'gym', muscleGroup: 'Full Body' },
  { id: 'high_plank', name: 'High Plank', category: 'Weighted Support', instructions: 'Hold a push-up position, keeping your body in a straight line from head to heels.', videoLink: 'https://www.youtube.com/watch?v=ASdvN_XEl_c', equipment: 'none', muscleGroup: 'Abs' },
  { id: 'hip_thrust', name: 'Hip Thrust', instructions: 'With your upper back on a bench, place a barbell across your hips. Drive your hips up by squeezing your glutes.', videoLink: 'https://www.youtube.com/watch?v=xDmFkJxPzeM', equipment: 'gym', muscleGroup: 'Legs' },

  // I
  { id: 'incline_bench_press', name: 'Incline Bench Press', instructions: 'Perform a bench press on an incline bench to target the upper chest.', videoLink: 'https://www.youtube.com/watch?v=SrqOu55lrqg', equipment: 'gym', muscleGroup: 'Chest' },
  { id: 'incline_dumbbell_bench_press', name: 'Incline Dumbbell Bench Press', instructions: 'Perform a dumbbell press on an incline bench.', videoLink: 'https://www.youtube.com/watch?v=8iPEnn-ltC8', equipment: 'minimal', muscleGroup: 'Chest' },
  { id: 'incline_dumbbell_curl', name: 'Incline Dumbbell Curl', instructions: 'Sit on an incline bench and let your arms hang straight down. Curl the dumbbells up.', videoLink: 'https://www.youtube.com/watch?v=soxrZlIl35U', equipment: 'minimal', muscleGroup: 'Biceps' },
  { id: 'incline_push_ups', name: 'Incline Push Ups', category: 'Weighted Support', instructions: 'Perform a push-up with your hands on an elevated surface like a bench, which makes the exercise easier.', videoLink: 'https://www.youtube.com/watch?v=Z0bRiDPD_hY', equipment: 'none', muscleGroup: 'Chest' },
  { id: 'inverted_row', name: 'Inverted Row', category: 'Weighted Support', instructions: 'Hang under a bar (e.g., in a Smith machine) with your body straight. Pull your chest up to the bar.', videoLink: 'https://www.youtube.com/watch?v=hOCgIXS8-0I', equipment: 'gym', muscleGroup: 'Back' },

  // J
  { id: 'jump_rope', name: 'Jump Rope', instructions: 'Skip or jump over a rope as it passes under your feet.', videoLink: 'https://www.youtube.com/watch?v=u3pgRk-NFk4', equipment: 'minimal', muscleGroup: 'Cardio' },
  { id: 'jumping_jacks', name: 'Jumping Jacks', category: 'Weighted Support', instructions: 'A full-body jumping exercise where you alternate between having feet together/arms down and feet apart/arms overhead.', videoLink: 'https://www.youtube.com/watch?v=iSSAk4XCsRA', equipment: 'none', muscleGroup: 'Cardio' },

  // K
  { id: 'kettlebell_goblet_squat', name: 'Kettlebell Goblet Squat', instructions: 'Hold a kettlebell at chest level and perform a squat.', videoLink: 'https://www.youtube.com/watch?v=5b00S3b5W4A', equipment: 'minimal', muscleGroup: 'Legs' },
  { id: 'kettlebell_swing', name: 'Kettlebell Swing', instructions: 'Hinge at your hips and swing the kettlebell up to chest height using the power from your hips and glutes.', videoLink: 'https://www.youtube.com/watch?v=sSESeQAir2M', equipment: 'minimal', muscleGroup: 'Full Body' },
  { id: 'kettlebell_turkish_get_ups', name: 'Kettlebell Turkish Get Ups', instructions: 'A complex exercise that involves moving from a lying position to a standing position while holding a kettlebell overhead.', videoLink: 'https://www.youtube.com/watch?v=0bWRPC49-KI', equipment: 'minimal', muscleGroup: 'Full Body' },

  // L
  { id: 'l_sit', name: 'L Sit', instructions: 'Support your body with your arms and hold your legs straight out in front of you, parallel to the floor.', videoLink: 'https://www.youtube.com/watch?v=I-3_XMlicGw', equipment: 'none', muscleGroup: 'Abs' },
  { id: 'landmine_press', name: 'Landmine Press', instructions: 'Kneel or stand and press the end of a barbell (placed in a landmine attachment) away from your body.', videoLink: 'https://www.youtube.com/watch?v=P_8t-354s0w', equipment: 'gym', muscleGroup: 'Shoulders' },
  { id: 'lat_pulldown', name: 'Lat Pulldown', instructions: 'Using a lat pulldown machine, pull the bar down to your upper chest, squeezing your back muscles.', videoLink: 'https://www.youtube.com/watch?v=0oeS5Jd5_x4', equipment: 'gym', muscleGroup: 'Back' },
  { id: 'leg_extension', name: 'Leg Extension', instructions: 'Using a leg extension machine, extend your knees against resistance to target the quads.', videoLink: 'https://www.youtube.com/watch?v=YyvSfVjQeL0', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'low_plank', name: 'Low Plank', instructions: 'Hold a plank position resting on your forearms instead of your hands.', videoLink: 'https://www.youtube.com/watch?v=TvxNkmjdhMM', equipment: 'none', muscleGroup: 'Abs' },
  { id: 'lunge', name: 'Lunge', category: 'Weighted Support', instructions: 'Step forward or backward and lower your hips until both knees are at a 90-degree angle.', videoLink: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U', equipment: 'none', muscleGroup: 'Legs' },
  { id: 'lying_leg_curl', name: 'Lying Leg Curl', instructions: 'Using a machine, lie face down and curl your legs up towards your glutes to target the hamstrings.', videoLink: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'lying_leg_raise', name: 'Lying Leg Raise', category: 'Weighted Support', instructions: 'Lie on your back and raise your straight legs up towards the ceiling.', videoLink: 'https://www.youtube.com/watch?v=JB2oyawG9KI', equipment: 'none', muscleGroup: 'Abs' },

  // M
  { id: 'machine_chest_fly', name: 'Machine Chest Fly', instructions: 'Use a pec deck or chest fly machine to isolate the chest muscles.', videoLink: 'https://www.youtube.com/watch?v=Z57CtFmRMxA', equipment: 'gym', muscleGroup: 'Chest' },
  { id: 'machine_shoulder_press', name: 'Machine Shoulder Press', instructions: 'Use a shoulder press machine to target the deltoids.', videoLink: 'https://www.youtube.com/watch?v=Wqq43dFJvoA', equipment: 'gym', muscleGroup: 'Shoulders' },
  { id: 'military_press', name: 'Military Press', instructions: 'A strict overhead press with a barbell, performed standing, without using leg drive.', videoLink: 'https://www.youtube.com/watch?v=2yjwXTZQDDI', equipment: 'gym', muscleGroup: 'Shoulders' },
  { id: 'mountain_climbers', name: 'Mountain Climbers', instructions: 'In a plank position, alternate bringing your knees towards your chest in a running motion.', videoLink: 'https://www.youtube.com/watch?v=nmwgirgXLYM', equipment: 'none', muscleGroup: 'Abs' },
  { id: 'muscle_ups', name: 'Muscle Ups', category: 'Weighted Support', instructions: 'An advanced gymnastic move involving a pull-up followed by a transition to a dip, performed on rings or a bar.', videoLink: 'https://www.youtube.com/watch?v=t-1PA-t4k_A', equipment: 'minimal', muscleGroup: 'Full Body' },

  // N
  { id: 'nordic_hamstring_curl', name: 'Nordic Hamstring Curl', category: 'Weighted Support', instructions: 'Secure your ankles and slowly lower your body towards the floor, controlling the movement with your hamstrings.', videoLink: 'https://www.youtube.com/watch?v=d_KZxkY_0cM', equipment: 'none', muscleGroup: 'Legs' },

  // O
  { id: 'overhead_squat', name: 'Overhead Squat', instructions: 'Hold a barbell overhead with a wide grip and perform a squat, requiring significant mobility and stability.', videoLink: 'https://www.youtube.com/watch?v=b2HjWb4C-oA', equipment: 'gym', muscleGroup: 'Legs' },

  // P
  { id: 'pallof_press', name: 'Pallof Press', instructions: 'Stand sideways to a cable machine. Hold the handle at your chest and press it straight out, resisting the rotational pull from the cable.', videoLink: 'https://www.youtube.com/watch?v=e-ua22I-KPg', equipment: 'gym', muscleGroup: 'Abs' },
  { id: 'pendlay_row', name: 'Pendlay Row', instructions: 'A strict bent-over row where the barbell rests on the floor between each rep.', videoLink: 'https://www.youtube.com/watch?v=g26dwAl24wE', equipment: 'gym', muscleGroup: 'Back' },
  { id: 'pike_push_ups', name: 'Pike Push Ups', category: 'Weighted Support', instructions: 'From a downward dog position, lower your head towards the floor to target the shoulders.', videoLink: 'https://www.youtube.com/watch?v=2yTrYV_u-yM', equipment: 'none', muscleGroup: 'Shoulders' },
  { id: 'pistol_squat', name: 'Pistol Squat', category: 'Weighted Support', instructions: 'An advanced exercise: perform a squat on one leg while holding the other leg straight out in front.', videoLink: 'https://www.youtube.com/watch?v=79-85D_Ibi0', equipment: 'none', muscleGroup: 'Legs' },
  { id: 'plank', name: 'Plank', category: 'Weighted Support', instructions: 'Hold a position on your forearms and toes, keeping your body in a straight line.', videoLink: 'https://www.youtube.com/watch?v=pvIjsG5Svck', equipment: 'none', muscleGroup: 'Abs' },
  { id: 'preacher_curl', name: 'Preacher Curl', instructions: 'Use a preacher bench to isolate the biceps during a curl.', videoLink: 'https://www.youtube.com/watch?v=f1186e-1b4Y', equipment: 'gym', muscleGroup: 'Biceps' },
  { id: 'pull_ups', name: 'Pull Ups', category: 'Weighted Support', instructions: 'Hang from a bar with an overhand grip. Pull your chest up to the bar.', videoLink: 'https://www.youtube.com/watch?v=eGo4IYlbE5g', equipment: 'minimal', muscleGroup: 'Back' },
  { id: 'push_press', name: 'Push Press', instructions: 'An overhead press where you use a dip and drive from your legs to help initiate the movement.', videoLink: 'https://www.youtube.com/watch?v=iaBVSJm78ko', equipment: 'gym', muscleGroup: 'Shoulders' },
  { id: 'push_ups', name: 'Push Ups', category: 'Weighted Support', instructions: 'Start in a plank position. Lower your body until your chest nearly touches the floor, then push back up.', videoLink: 'https://www.youtube.com/watch?v=IODxDxX7oi4', equipment: 'none', muscleGroup: 'Chest' },

  // R
  { id: 'rack_pull', name: 'Rack Pull', instructions: 'Perform a deadlift from an elevated position by setting the barbell on the safety pins of a power rack. This shortens the range of motion.', videoLink: 'https://www.youtube.com/watch?v=Jp_Kv0S3I3c', equipment: 'gym', muscleGroup: 'Back' },
  { id: 'renegade_row', name: 'Renegade Row', instructions: 'In a high plank position with hands on dumbbells, perform a row with one arm at a time, keeping your core stable.', videoLink: 'https://www.youtube.com/watch?v=yP5p-0Bda2w', equipment: 'minimal', muscleGroup: 'Back' },
  { id: 'reverse_crunches', name: 'Reverse Crunches', category: 'Weighted Support', instructions: 'Lie on your back and bring your knees towards your chest by lifting your hips off the floor.', videoLink: 'https://www.youtube.com/watch?v=hyv14e2w0oE', equipment: 'none', muscleGroup: 'Abs' },
  { id: 'reverse_grip_lat_pulldown', name: 'Reverse Grip Lat Pulldown', instructions: 'Perform a lat pulldown with an underhand (supinated) grip.', videoLink: 'https://www.youtube.com/watch?v=apzFTbsm7HU', equipment: 'gym', muscleGroup: 'Back' },
  { id: 'reverse_lunge', name: 'Reverse Lunge', category: 'Weighted Support', instructions: 'Step backward into a lunge, lowering your hips until both knees are at a 90-degree angle.', videoLink: 'https://www.youtube.com/watch?v=H0KE-v-U4A8', equipment: 'none', muscleGroup: 'Legs' },
  { id: 'romanian_deadlift', name: 'Romanian Deadlift', instructions: 'From a standing position, hinge at your hips, keeping your back straight and legs nearly straight. Lower the bar until you feel a deep stretch in your hamstrings.', videoLink: 'https://www.youtube.com/watch?v=2C7YxHIL35A', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'rowing_machine', name: 'Rowing Machine', instructions: 'Use a rowing machine (ergometer) for a full-body cardiovascular workout.', videoLink: 'https://www.youtube.com/watch?v=H0r_ZPXJLtg', equipment: 'gym', muscleGroup: 'Cardio' },
  { id: 'running', name: 'Running', instructions: 'Running or jogging at various speeds and distances.', videoLink: '', equipment: 'none', muscleGroup: 'Cardio' },
  { id: 'russian_twist', name: 'Russian Twist', category: 'Weighted Support', instructions: 'Sit on the floor, lean back with your feet elevated, and twist your torso from side to side.', videoLink: 'https://www.youtube.com/watch?v=wkD8rjkodUI', equipment: 'none', muscleGroup: 'Abs' },

  // S
  { id: 'safety_bar_squat', name: 'Safety Bar Squat', instructions: 'Perform a squat using a safety squat bar, which changes the weight distribution and is often easier on the shoulders.', videoLink: 'https://www.youtube.com/watch?v=a-62oK-aB6o', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'seated_cable_row', name: 'Seated Cable Row', instructions: 'Sit at a low pulley machine with your feet on the platform. Pull the handle towards your torso, squeezing your back muscles.', videoLink: 'https://www.youtube.com/watch?v=GZbfZ033f74', equipment: 'gym', muscleGroup: 'Back' },
  { id: 'seated_calf_raise', name: 'Seated Calf Raise', instructions: 'Use a seated calf raise machine to target the soleus muscle.', videoLink: 'https://www.youtube.com/watch?v=Jfl_gS_9zIE', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'seated_leg_curl', name: 'Seated Leg Curl', instructions: 'Use a machine to curl your legs down against resistance to target the hamstrings.', videoLink: 'https://www.youtube.com/watch?v=oFxEDk1a0o4', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'shoulder_press', name: 'Shoulder Press', instructions: 'Press a weight (barbell, dumbbell, etc.) overhead from a shoulder-level position.', videoLink: 'https://www.youtube.com/watch?v=2yjwXTZQDDI', equipment: 'gym', muscleGroup: 'Shoulders' },
  { id: 'side_lunge', name: 'Side Lunge', category: 'Weighted Support', instructions: 'Step out to one side, keeping the other leg straight. Bend the knee of the leading leg and lower your hips.', videoLink: 'https://www.youtube.com/watch?v=S5-3D_Ydf6o', equipment: 'none', muscleGroup: 'Legs' },
  { id: 'side_plank', name: 'Side Plank', instructions: 'Support your body on one forearm and the side of your foot, keeping your body in a straight line.', videoLink: 'https://www.youtube.com/watch?v=NXr4Fw8q60o', equipment: 'none', muscleGroup: 'Abs' },
  { id: 'single_leg_deadlift', name: 'Single Leg Deadlift', instructions: 'Perform a deadlift on one leg, focusing on balance and stability.', videoLink: 'https://www.youtube.com/watch?v=htzU_GOM72Q', equipment: 'minimal', muscleGroup: 'Legs' },
  { id: 'sissy_squat', name: 'Sissy Squat', category: 'Weighted Support', instructions: 'An exercise that isolates the quads by leaning back and bending the knees, keeping the hips extended.', videoLink: 'https://www.youtube.com/watch?v=jW-sSuYdZ3o', equipment: 'none', muscleGroup: 'Legs' },
  { id: 'sit_ups', name: 'Sit Ups', category: 'Weighted Support', instructions: 'Lie on your back and raise your entire torso to a sitting position.', videoLink: 'https://www.youtube.com/watch?v=1fbU_MkV7NE', equipment: 'none', muscleGroup: 'Abs' },
  { id: 'smith_machine_squat', name: 'Smith Machine Squat', instructions: 'Perform a squat using a Smith machine.', videoLink: 'https://www.youtube.com/watch?v=V-63vKAFb-A', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'snatch', name: 'Snatch', instructions: 'An Olympic lift. Explosively lift a barbell from the floor to an overhead position in one continuous motion.', videoLink: 'https://www.youtube.com/watch?v=9xQp2sldyts', equipment: 'gym', muscleGroup: 'Full Body' },
  { id: 'squat', name: 'Squat', instructions: 'With a barbell on your back, lower your hips as if sitting in a chair, keeping your chest up and back straight.', videoLink: 'https://www.youtube.com/watch?v=bEv6CCg2BC8', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'squat_jump', name: 'Squat Jump', category: 'Weighted Support', instructions: 'Perform a bodyweight squat and explode into a jump.', videoLink: 'https://www.youtube.com/watch?v=72BSd4s5a2M', equipment: 'none', muscleGroup: 'Legs' },
  { id: 'stair_machine', name: 'Stair Machine', instructions: 'Use a stair climbing machine for a cardiovascular workout.', videoLink: '', equipment: 'gym', muscleGroup: 'Cardio' },
  { id: 'standing_leg_curl', name: 'Standing Leg Curl', instructions: 'Use a machine to perform leg curls one leg at a time while standing.', videoLink: 'https://www.youtube.com/watch?v=rTbl-8hP8gM', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'step_ups', name: 'Step Ups', category: 'Weighted Support', instructions: 'Step up onto a box or bench, driving through your leading leg.', videoLink: 'https://www.youtube.com/watch?v=l4AA6Afl2wE', equipment: 'minimal', muscleGroup: 'Legs' },
  { id: 'straight_arm_pulldown', name: 'Straight Arm Pulldown', instructions: 'Using a high cable pulley and a bar, pull the bar down to your thighs while keeping your arms straight.', videoLink: 'https://www.youtube.com/watch?v=D-aevATh2b0', equipment: 'gym', muscleGroup: 'Back' },
  { id: 'sumo_deadlift', name: 'Sumo Deadlift', instructions: 'Perform a deadlift with a very wide stance and your hands inside your legs.', videoLink: 'https://www.youtube.com/watch?v=Xsls8lQda4A', equipment: 'gym', muscleGroup: 'Full Body' },
  { id: 'sumo_squat', name: 'Sumo Squat', instructions: 'Perform a squat with a very wide stance and toes pointed outwards.', videoLink: 'https://www.youtube.com/watch?v=yPWY4V-aC28', equipment: 'minimal', muscleGroup: 'Legs' },
  { id: 'superman', name: 'Superman', category: 'Weighted Support', instructions: 'Lie face down and simultaneously lift your arms, chest, and legs off the floor.', videoLink: 'https://www.youtube.com/watch?v=z6PJMT2y8GQ', equipment: 'none', muscleGroup: 'Back' },
  { id: 'swimming', name: 'Swimming', instructions: 'Propelling your body through water using various strokes.', videoLink: '', equipment: 'none', muscleGroup: 'Cardio' },

  // T
  { id: 't_bar_row', name: 'T Bar Row', instructions: 'Use a T-bar apparatus to perform a bent-over row.', videoLink: 'https://www.youtube.com/watch?v=j3Igk5nyZE4', equipment: 'gym', muscleGroup: 'Back' },
  { id: 'thruster', name: 'Thruster', instructions: 'Perform a front squat and use the upward momentum to press the barbell overhead in one fluid motion.', videoLink: 'https://www.youtube.com/watch?v=M5fXm2f67R4', equipment: 'gym', muscleGroup: 'Full Body' },
  { id: 'toes_to_bar', name: 'Toes to Bar', category: 'Weighted Support', instructions: 'Hang from a bar and raise your toes to touch the bar.', videoLink: 'https://www.youtube.com/watch?v=n24i_94K9M0', equipment: 'minimal', muscleGroup: 'Abs' },
  { id: 'treadmill', name: 'Treadmill', instructions: 'Walking, jogging, or running on a treadmill.', videoLink: '', equipment: 'gym', muscleGroup: 'Cardio' },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', instructions: 'Using a high cable pulley, press a bar or rope attachment down until your arms are fully extended.', videoLink: 'https://www.youtube.com/watch?v=2-LAMcpzODU', equipment: 'gym', muscleGroup: 'Triceps' },
  { id: 'trx_row', name: 'TRX Row', category: 'Weighted Support', instructions: 'Lean back holding TRX straps and pull your chest towards your hands.', videoLink: 'https://www.youtube.com/watch?v=K-0-d-nC2I0', equipment: 'minimal', muscleGroup: 'Back' },

  // U
  { id: 'upright_row', name: 'Upright Row', instructions: 'Hold a barbell or dumbbells and pull the weight up towards your chin, leading with your elbows.', videoLink: 'https://www.youtube.com/watch?v=w3iB2zGgM_M', equipment: 'gym', muscleGroup: 'Shoulders' },

  // V
  { id: 'v_ups', name: 'V Ups', category: 'Weighted Support', instructions: 'Lie on your back and simultaneously lift your legs and torso, touching your toes at the top.', videoLink: 'https://www.youtube.com/watch?v=iP2fjvG_xU8', equipment: 'none', muscleGroup: 'Abs' },

  // W
  { id: 'walking', name: 'Walking', instructions: 'Walking at various paces and distances.', videoLink: '', equipment: 'none', muscleGroup: 'Cardio' },
  { id: 'walking_lunge', name: 'Walking Lunge', instructions: 'Perform lunges while continuously stepping forward.', videoLink: 'https://www.youtube.com/watch?v=L8fvypoCDHM', equipment: 'none', muscleGroup: 'Legs' },
  { id: 'wall_ball', name: 'Wall Ball', instructions: 'Hold a medicine ball, squat down, and explosively stand up, throwing the ball against a target on a wall.', videoLink: 'https://www.youtube.com/watch?v=nI1htoiY_3g', equipment: 'minimal', muscleGroup: 'Full Body' },
  { id: 'wall_sit', name: 'Wall Sit', category: 'Weighted Support', instructions: 'Hold a squat position with your back against a wall.', videoLink: 'https://www.youtube.com/watch?v=y-wV4JuaQmM', equipment: 'none', muscleGroup: 'Legs' },
  { id: 'wide_grip_pull_ups', name: 'Wide Grip Pull Ups', category: 'Weighted Support', instructions: 'Perform pull-ups with a grip wider than shoulder-width.', videoLink: 'https://www.youtube.com/watch?v=IYm6dI32-G4', equipment: 'minimal', muscleGroup: 'Back' },
  { id: 'wide_grip_push_ups', name: 'Wide Grip Push Ups', category: 'Weighted Support', instructions: 'Perform push-ups with your hands placed wider than your shoulders.', videoLink: 'https://www.youtube.com/watch?v=Cyb-4TYC7Fw', equipment: 'none', muscleGroup: 'Chest' },

  // Y
  { id: 'yates_row', name: 'Yates Row', instructions: 'A bent-over row variation popularized by Dorian Yates, performed with a more upright torso and an underhand grip.', videoLink: 'https://www.youtube.com/watch?v=Sqo-jV2P_ik', equipment: 'gym', muscleGroup: 'Back' },
  { id: 'yoga', name: 'Yoga', instructions: 'A practice involving physical postures, breathing techniques, and meditation.', videoLink: '', equipment: 'none', muscleGroup: 'Other' },

  // Z
  { id: 'z_press', name: 'Z Press', instructions: 'An overhead press performed while seated on the floor with your legs straight out in front of you, challenging core stability.', videoLink: 'https://www.youtube.com/watch?v=mMAo0aFncus', equipment: 'gym', muscleGroup: 'Shoulders' },
  { id: 'zercher_squat', name: 'Zercher Squat', instructions: 'Perform a squat while holding a barbell in the crook of your elbows.', videoLink: 'https://www.youtube.com/watch?v=DaK8y7p82kY', equipment: 'gym', muscleGroup: 'Legs' },
  { id: 'zottman_curl', name: 'Zottman Curl', instructions: 'Curl a dumbbell up with a standard (supinated) grip, then rotate your wrist at the top and lower it with an overhand (pronated) grip.', videoLink: 'https://www.youtube.com/watch?v=Ftdv2OQU32g', equipment: 'minimal', muscleGroup: 'Biceps' },
];
