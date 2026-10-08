/* Deep Time: game data and rules. No DOM access in this file. */
const ERAS=[
{name:'Primordial Soup',when:'3.8 billion years ago',unit:'nutrients',tap:'Absorb',h:188,ah:168,s:45,adv:2400,
 fig:'Fig. 1 · A single cell, 0.002 mm across',next:'Cluster into a colony',
 intro:'A warm vent on a young sea floor. A membrane closes around a few chemicals and something begins to copy itself. You are the first cell.',
 gens:[['Flagellum','A whip-like tail that steers you toward food.'],['Chloroplast','Capture sunlight and turn it into sugar.'],['Mitochondrion','A tiny furnace that burns food far more efficiently.']],
 upg:[['Sticky Membrane','Nutrients cling to you. Absorbing gives 3× more.','tap'],['Efficient Enzymes','Chloroplasts work 2.5× faster.','gen',1],['Faster Chemistry','Every trait works 1.6× faster.','all']]},
{name:'Colony Reef',when:'600 million years ago',unit:'biomass',tap:'Divide',h:335,ah:345,s:45,adv:2400,
 fig:'Fig. 2 · A cell colony, 0.4 mm across',next:'Grow a spine and swim',
 intro:'Cells that stay together survive together. Some learn to be skin, some to be gut, some to sense the light.',
 gens:[['Specialized Cells','Division of labor: each cell does one job well.'],['Nerve Net','A web of signals lets the colony act as one.'],['Hard Shell','Calcium armor protects the soft body.']],
 upg:[['Cell Adhesion','Cells divide in step. Dividing gives 3× more.','tap'],['Filter Feeding','Nerve nets work 2.5× faster.','gen',1],['Sensory Pits','Every trait works 1.6× faster.','all']]},
{name:'Ocean Depths',when:'480 million years ago',unit:'calories',tap:'Hunt',h:215,ah:205,s:50,adv:2400,
 fig:'Fig. 3 · A jawless fish, 12 cm',next:'Crawl onto the shore',
 intro:'You have a front and a back, a mouth and a brain. The sea is full of things to eat, and things that eat you.',
 gens:[['Gills','Pull more oxygen from the water.'],['Backbone','A flexible spine for fast, powerful swimming.'],['Jaws','Bite, crush and tear. The sea gets a lot smaller.']],
 upg:[['Streamlined Body','Hunting gives 3× more.','tap'],['Fin Control','Backbones work 2.5× faster.','gen',1],['Lateral Line','Every trait works 1.6× faster.','all']]},
{name:'Tidal Shore',when:'375 million years ago',unit:'calories',tap:'Forage',h:28,ah:38,s:42,adv:2400,
 fig:'Fig. 4 · An early tetrapod, 1 m long',next:'Climb into the canopy',
 intro:'Fins become limbs. You haul yourself onto the mud, gasping, into a world with almost no predators yet.',
 gens:[['Lungs','Breathe air when the tide goes out.'],['Limbs','Fins become legs that can push through mud.'],['Leathery Eggs','Lay eggs on dry land, away from sea predators.']],
 upg:[['Strong Wrists','Foraging gives 3× more.','tap'],['Dry Skin','Limbs work 2.5× faster.','gen',1],['Keen Hearing','Every trait works 1.6× faster.','all']]},
{name:'Canopy Night',when:'200 million years ago',unit:'calories',tap:'Scavenge',h:140,ah:125,s:40,adv:2400,
 fig:'Fig. 5 · A shrew-like mammal, 10 cm',next:'Stand up on the savanna',
 intro:'Small, warm, furred, and mostly awake at night. The giants rule the day, so you learn to be clever in the dark.',
 gens:[['Warm Blood','Stay active through the cold night.'],['Dense Fur','Insulation lets you eat less and roam further.'],['Milk','Feed your young and raise them more safely.']],
 upg:[['Night Vision','Scavenging gives 3× more.','tap'],['Burrow Network','Shared dens keep everyone warm. Fur works 2.5× faster.','gen',1],['Social Calls','Every trait works 1.6× faster.','all']]},
{name:'Savanna Fire',when:'3 million years ago',unit:'food',tap:'Gather',h:18,ah:24,s:48,adv:2400,
 fig:'Fig. 6 · An early hominin, 1.1 m tall',next:'Plant the first seeds',
 intro:'You stand upright. Hands free, eyes on the horizon. A spark from lightning, a stone with an edge. You are becoming something new.',
 gens:[['Upright Walk','Hands free, eyes on the horizon.'],['Stone Tools','Edges that cut meat and crack bones.'],['Controlled Fire','Cook food, scare predators, stay up late.']],
 upg:[['Pebble Hammer','Gathering gives 3× more.','tap'],['Hunting Band','Stone tools work 2.5× faster.','gen',1],['Spoken Language','Every trait works 1.6× faster.','all']]},
{name:'First Settlements',when:'10,000 BCE',unit:'grain',tap:'Harvest',h:45,ah:48,s:45,adv:2400,
 fig:'Fig. 7 · A village of 200 people',next:'Raise kingdoms',
 intro:'You stop following the herds and start keeping them. Seeds in the soil, walls around the fire. The first villages appear.',
 gens:[['Granary','Store grain through the lean season.'],['Plough','Turn more soil with less labor.'],['Village','Hundreds of people share the work.']],
 upg:[['Seed Selection','Harvesting gives 3× more.','tap'],['Irrigation Ditches','Ploughs work 2.5× faster.','gen',1],['Written Tally','Every trait works 1.6× faster.','all']]},
{name:'Kingdoms',when:'3000 BCE to 1500 CE',unit:'coin',tap:'Trade',h:270,ah:350,s:38,adv:2400,
 fig:'Fig. 8 · A walled city of 10,000 people',next:'Fire the first furnace',
 intro:'Bronze, iron, roads and laws. Cities rise and fall. Writing carries memory across generations.',
 gens:[['Marketplace','Strangers trade goods for coin.'],['Aqueduct','Water for cities the land could not feed.'],['University','Scholars turn curiosity into craft.']],
 upg:[['Standard Coinage','Trading gives 3× more.','tap'],['Roman Concrete','Aqueducts work 2.5× faster.','gen',1],['Common Law','Every trait works 1.6× faster.','all']]},
{name:'Industrial Age',when:'1760 to 1900',unit:'goods',tap:'Produce',h:30,ah:24,s:12,adv:2400,
 fig:'Fig. 9 · An industrial town of 100,000 people',next:'Wire the world',
 intro:'Steam turns water into motion. Coal and iron remake the landscape. A day of work becomes a minute.',
 gens:[['Steam Engine','Coal becomes motion.'],['Railway','Move goods across a continent in days.'],['Factory','Machines make a thousand of anything.']],
 upg:[['Interchangeable Parts','Producing gives 3× more.','tap'],['Telegraph','Railways work 2.5× faster.','gen',1],['Electric Light','Every trait works 1.6× faster.','all']]},
{name:'Information Age',when:'1950 to 2020',unit:'data',tap:'Compute',h:225,ah:190,s:55,adv:2400,
 fig:'Fig. 10 · A metropolis of 10 million people',next:'Reach for orbit',
 intro:'Transistors, networks, and the whole planet wired together. You can talk to anyone, and ask anything.',
 gens:[['Microchip','Billions of switches on a thumbnail.'],['Data Center','Warehouses that think for the whole planet.'],['Global Network','Every person and machine, connected.']],
 upg:[['Touch Interface','Computing gives 3× more.','tap'],['Fiber Optics','Data centers work 2.5× faster.','gen',1],['Machine Learning','Every trait works 1.6× faster.','all']]},
{name:'Space Age',when:'1957 onward',unit:'payload',tap:'Launch',h:250,ah:42,s:40,adv:6000,
 fig:'Fig. 11 · Low Earth orbit, 400 km up',next:'Settle other worlds',
 intro:'You look up, and for the first time you can leave. Orbits, moons, and then the next star.',
 gens:[['Satellite Constellation','Eyes and voices circling the Earth.'],['Orbital Station','A home above the sky.'],['Lunar Foundry','Mine and build on another world.']],
 upg:[['Reusable Rockets','Launching gives 3× more.','tap'],['Ion Drives','Orbital stations work 2.5× faster.','gen',1],['Fusion Reactor','Every trait works 1.6× faster.','all']]}
,
{name:'Colony Worlds',when:'2100 CE onward',unit:'tonnes',tap:'Settle',h:12,ah:28,s:52,adv:6800,
 fig:'Fig. 12 · A domed city on Mars',next:'Capture the sun',
 intro:'Your people live on more than one world now: red deserts under glass, ice moons, cities that spin in orbit. Every world drifts a little differently from the others.',
 gens:[['Habitat Dome','Sealed towns of glass on a cold red world.'],['Terraforming Engine','Warm the air and wake the soil.'],['Orbital Elevator','A cable to the sky. Cargo rides up almost for free.']],
 upg:[['Mass Drivers','Settling gives 3× more.','tap'],['Closed-Loop Farms','Terraforming engines work 2.5× faster.','gen',1],['Artificial Gravity','Every trait works 1.6× faster.','all']]},
{name:'Stellar Age',when:'A thousand years on',unit:'terawatts',tap:'Harvest',h:42,ah:34,s:62,adv:6800,
 fig:'Fig. 13 · A swarm of mirrors around a star',next:'Ascend',
 intro:'A star pours out more energy in one second than your people have ever used. Now you can catch it. What you become when you hold that much power is the last choice.',
 gens:[['Solar Collector','A mirror a thousand kilometres wide, in orbit around the sun.'],['Swarm Foundry','Takes a planet apart and makes a million more collectors.'],['Dyson Ring','A band around the star that catches its light.']],
 upg:[['Beamed Power','Harvesting gives 3× more.','tap'],['Stellar Lifting','Swarm foundries work 2.5× faster.','gen',1],['Matrioshka Mind','Every trait works 1.6× faster.','all']]}
].map(e=>({...e,gens:e.gens.map(g=>({n:g[0],d:g[1]})),upg:e.upg.map(u=>({n:u[0],d:u[1],k:u[2],i:u[3]}))}));

/* Evolution cost per stage, in multiples of that stage's base scale (8^stage). Tuned so later stages take longer. */
[2800,6800,14400,28800,56000,99000,168000,308000,544000,936000,2080000,3800000,6800000].forEach((a,i)=>{ERAS[i].adv=a;});

/* What each purchase looks like in the scene. Shown as a short caption when you buy it.
   a: adaptations, g: the first of each trait, n: tech and civic branches (ambient effects around your people). */
const LOOKS={
 a:[
  ['Your cell grows a thick, sticky membrane studded with tiny hooks.','Bright enzyme sparks race around inside the cell.','A shimmering ring spins around your cell and its tail beats faster.'],
  ['Sticky strands bind the cells tightly together.','Feeding fringes pull plankton in toward the colony.','Eyespots open across the outer cells.'],
  ['Your body turns sleek, with speed lines streaming behind.','Bigger, brighter fins fan out.','A line of sensors runs along your flank and sends out ripples.'],
  ['Strong wrists press deep footprints into the sand.','Dry, scaly skin covers your back.','A round eardrum appears and sound waves flow in.'],
  ['Your eyes glow in the dark and cast a pale cone of light.','A burrow with a warm den opens in the ground.','Calls echo through the night and others answer.'],
  ['A hammerstone and flying chips appear in your hands.','Hunters with spears join you, and meat hangs to dry.','Speech bubbles rise above your band.'],
  ['Well-chosen golden crops fill the rows.','Blue irrigation channels cut across the fields.','A tally post and clay tablets keep count of the harvest.'],
  ['Gold coins glint over the markets and a gold banner flies.','A thick stone wall with a gate rings the city.','A law column with scales stands in the square.'],
  ['Crates and gears stack up in the yard.','Telegraph poles and wires cross the town.','Windows glow and street lamps light the evening.'],
  ['Holographic panels float over the city and ripple at a touch.','Light streaks race along fiber lines.','A glowing neural network spreads across the skyline.'],
  ['Rockets lift off and land again on a column of flame.','Blue ion trails stream behind your craft.','A fusion star blazes beside your station.'],
  ['Mass driver tracks gleam across the red plain and sleds streak to orbit.','Green fields glow under rows of lamps inside the domes.','A ring habitat spins slowly, with lights along its inner rim.'],
  ['A bright beam of power links the collectors to the worlds.','Streams of matter lift from a planet into the foundry.','Nested shells glitter around the star.']
 ],
 g:[
  ['A whip-like tail grows from your cell.','Green chloroplasts appear inside your cell.','Orange mitochondria appear inside your cell.'],
  ['Cells take on different roles and colors.','A glowing nerve net links the colony.','A hard white shell wraps the colony.'],
  ['Red gills open along your sides.','A white backbone and ribs show through your body.','Your jaws open, lined with teeth.'],
  ['Pink lungs glow in your chest and you breathe out puffs of air.','Four strong legs replace your fins.','A nest of leathery eggs sits on the sand.'],
  ['A warm glow surrounds your body.','Dense fur covers your back.','Pups follow close behind you.'],
  ['You stand upright and walk on two legs.','You carry a stone-tipped spear and keep a pile of stones.','A fire burns, and the band gathers round it.'],
  ['A granary on stilts holds the harvest.','An ox pulls a plough across the field.','More houses crowd the village.'],
  ['Colorful market stalls fill the square.','An aqueduct strides across the valley.','A domed university rises with a lit window.'],
  ['A steam engine chugs, its wheel turning and steam rising.','Rails and a train cross the town.','A factory rises with smoking chimneys.'],
  ['Glowing circuit traces cover the ground and rooftops.','A data center blinks with server lights.','Network links arc between the towers.'],
  ['Satellites circle overhead.','A space station orbits in the light.','Lights and a dome spread across the Moon.'],
  ['Glass domes glow on the red plain.','A terraforming plant breathes out a green haze.','A thin cable climbs from the surface into the sky.'],
  ['Mirror sails open around the sun.','A foundry glows and feeds new sails into the swarm.','A bright ring closes around the star.']
 ],
 n:{
  S:'Plenty drifts through your world as glowing motes of food.',
  M:'A web of insight lights up in the sky above your people.',
  C:'Gears and tools turn along the edge of your world.',
  K:'Glowing bonds link your people across the land.',
  D:'A halo of shared belief rises over your people.',
  X:'Coins travel along trade routes between your people.'
 }
};

const LINEAGES={
 hunter:{n:'Apex Hunter',d:'Sharp senses and strong jaws. Every tap is worth 3×.',fx:{t:3}},
 herd:{n:'Social Herd',d:'Strength in numbers. Every trait produces 1.35× more.',fx:{e:1.35}},
 thinker:{n:'Curious Thinker',d:'Big brain, small teeth. Adaptations cost 30% less, traits produce 1.1× more, insight grows 15% faster.',fx:{upg:.7,e:1.1,i:1.15}}
};

const EVENTS=[
{eras:[0,2],title:'Thermal vent bloom',text:'A plume of warm, mineral-rich water drifts your way.',opts:[
 {l:'Swim into the plume',d:'Risky. Rich feeding, or a scalding.',fx:[{risk:.65,win:[{gain:100}],fail:[{lose:.15}]}]},
 {l:'Hold position',d:'Safe. Everything runs 1.5× faster for 30 seconds.',fx:[{buff:[1.5,30]}]}]},
{eras:[0,4],title:'Meteor shower',text:'Streaks of fire cross the sky and the water boils at the edges.',opts:[
 {l:'Shelter below the sediment',d:'Costs 10% of your stock. Then 1.4× faster for 45 seconds.',fx:[{lose:.1},{buff:[1.4,45]}]},
 {l:'Feed in the chaos',d:'50% chance of a big haul, otherwise you lose 20%.',fx:[{risk:.5,win:[{gain:240}],fail:[{lose:.2}]}]}]},
{eras:[2,5],title:'A hard season',text:'The sky darkens. Many of your neighbors will not last the year.',opts:[
 {l:'Burrow and wait',d:'Safe. Everything runs 1.5× faster for 45 seconds.',fx:[{buff:[1.5,45]}]},
 {l:'Range far for food',d:'50% chance of a huge haul, otherwise you lose 25%.',fx:[{risk:.5,win:[{gain:260}],fail:[{lose:.25}]}]}]},
{eras:[4,7],title:'A hard winter',text:'The cold comes early. Food is scarce and the nights are long.',opts:[
 {l:'Migrate south',d:'Safe. A haul along the way.',fx:[{gain:100}]},
 {l:'Stay and adapt',d:'Everything runs 1.4× faster for 60 seconds.',fx:[{buff:[1.4,60]}]}]},
{eras:[5,7],title:'A wandering band',text:'Strangers appear on the horizon, carrying tools you do not recognize.',opts:[
 {l:'Trade with them',d:'Safe. A good exchange.',fx:[{gain:120}]},
 {l:'Defend your territory',d:'55% chance of taking their stores, otherwise you lose 30%.',fx:[{risk:.55,win:[{gain:300}],fail:[{lose:.3}]}]}]},
{eras:[6,8],title:'Plague',text:'A fever moves from house to house.',opts:[
 {l:'Quarantine the sick',d:'Costs 10% of your stock. Then 1.3× faster for 40 seconds.',fx:[{lose:.1},{buff:[1.3,40]}]},
 {l:'Carry on as usual',d:'60% chance nothing happens but a small gain, otherwise you lose 35%.',fx:[{risk:.6,win:[{gain:150}],fail:[{lose:.35}]}]}]},
{eras:[6,8],title:'Merchant caravan',text:'A caravan of strangers offers rare goods from distant lands.',opts:[
 {l:'Buy their goods',d:'Costs 15% of your stock. Then 2× faster for 30 seconds.',fx:[{lose:.15},{buff:[2,30]}]},
 {l:'Tax their passage',d:'Safe. A steady gain.',fx:[{gain:90}]}]},
{eras:[8,10],title:'Solar flare',text:'A geomagnetic storm flickers across every wire and antenna.',opts:[
 {l:'Shut everything down',d:'Costs 10% of your stock. Safe.',fx:[{lose:.1}]},
 {l:'Ride it out',d:'50% chance of a big gain, otherwise you lose 25%.',fx:[{risk:.5,win:[{gain:300}],fail:[{lose:.25}]}]}]},
{eras:[9,10],title:'A viral idea',text:'Something a stranger posted is suddenly everywhere.',opts:[
 {l:'Share it freely',d:'Safe. A large gain.',fx:[{gain:200}]},
 {l:'Build a business on it',d:'Everything runs 1.6× faster for 40 seconds.',fx:[{buff:[1.6,40]}]}]},
{eras:[10,10],title:'Comet passing',text:'A comet swings through the inner system, rich in ice and metal.',opts:[
 {l:'Mine it',d:'Safe. A massive haul.',fx:[{gain:400}]},
 {l:'Study it',d:'Everything runs 2× faster for 60 seconds.',fx:[{buff:[2,60]}]}]}
];

/* ---------- Direction, innovation trees, civics and character ---------- */
const FOCUS={
 balanced:{n:'Balanced',d:'Split your effort evenly.',e:1,i:1,c:1},
 grow:{n:'Grow',d:'Production ×1.3. Insight and cohesion ×0.6.',e:1.3,i:.6,c:.6},
 learn:{n:'Learn',d:'Insight ×2. Production ×0.8, cohesion ×0.6.',e:.8,i:2,c:.6},
 society:{n:'Society',d:'Cohesion ×2. Production ×0.8, insight ×0.6.',e:.8,i:.6,c:2}
};
const APPROACH={
 expand:{n:'Expand',d:'Production ×1.3, but evolving costs 15% more.',fx:{e:1.3,adv:1.15}},
 endure:{n:'Endure',d:'Production ×1.1, event losses halved, gambles 15% likelier to pay off.',fx:{e:1.1,bad:.5,luck:.15}},
 explore:{n:'Explore',d:'Insight and cohesion ×1.6, but production ×0.85.',fx:{i:1.6,c:1.6,e:.85}}
};
const MARKS={
 merciful:{n:'Merciful',fx:{c:1.15,e:.95}},
 ruthless:{n:'Ruthless',fx:{e:1.15,c:.9}},
 curious:{n:'Curious',fx:{i:1.2,bad:1.1}},
 cautious:{n:'Cautious',fx:{bad:.8,e:.95}},
 generous:{n:'Generous',fx:{c:1.15}},
 greedy:{n:'Hoarders',fx:{e:1.12,c:.92}},
 pious:{n:'Devout',fx:{c:1.15,i:.95}},
 rational:{n:'Skeptics',fx:{i:1.15,c:.95}},
 wanderer:{n:'Wanderers',fx:{i:1.1,e:1.05}},
 rooted:{n:'Rooted',fx:{e:1.1,bad:.9}},
 bold:{n:'Bold',fx:{luck:.1,bad:1.1}}
};
/* Each tier is one option, or two options that exclude each other. Option = [name, description, effects]. */
const TREES={
 tech:{name:'Innovations',res:'Insight',verb:'Research',gate:[0,2,4,6,8,10,11,12],c0:60,branches:[
  {id:'S',name:'Sustenance',tag:'Feed more mouths',tiers:[
   [['Chemosynthesis','Drink from the vents and waste nothing.',{e:1.15}]],
   [['Omnivore Gut','Eat anything. Bad events cost less.',{e:1.08,bad:.75}],['Fat Reserves','Store energy for lean years. Slows curiosity.',{e:1.2,i:.85}]],
   [['Foraging Routes','Learn where the fruit ripens and when.',{e:1.12,i:1.05}]],
   [['Agriculture','Fields feed far more mouths.',{e:1.3}],['Pastoralism','Herds follow you. Every tap counts for more.',{e:1.12,t:2}]],
   [['Steam Power','Coal does the work of a thousand backs.',{e:1.3}]],
   [['Fusion Reactors','Cheap power makes every future stage easier.',{e:1.2,adv:.85}],['Orbital Solar','Endless sunlight, beamed down. Costs social trust.',{e:1.45,c:.85}]],
   [['Closed Ecologies','Whole biospheres in a box. Steady food on every world.',{e:1.3,bad:.85}],['Engineered Crops','Plants redesigned for red soil and dim suns.',{e:1.2,gain:1.2}]],
   [['Stellar Farms','Grow food straight from starlight.',{e:1.5}],['Matter Compilers','Assemble anything from raw atoms. Traits cost less.',{e:1.3,g:.85}]]]},
  {id:'M',name:'Mind',tag:'Learn faster',tiers:[
   [['Chemotaxis','Sense the gradient and follow it.',{i:1.3,e:1.04}]],
   [['Lateral Line','Feel the whole sea at once. Gambles pay off more often.',{i:1.2,luck:.1}],['Deep Brain','A big brain sees shortcuts. Evolving costs less, at some cost to production.',{i:1.4,adv:.9,e:.92}]],
   [['Play','Young animals learn by play.',{i:1.3,c:1.1,e:1.04}]],
   [['Writing','Memory outlives the rememberer.',{i:1.4,adv:.9}],['Oral Epics','Songs hold a people together.',{i:1.15,c:1.4}]],
   [['Scientific Method','Test everything. Keep what survives.',{i:1.5,adv:.88}]],
   [['Artificial Minds','Tools that think. They teach you much and trust you less.',{i:2,c:.8,adv:.85}],['Deep Listening','Search the sky for anyone out there.',{i:1.5,luck:.15,gain:1.3}]],
   [['Quantum Computing','Search all the answers at once.',{i:1.6,adv:.9}],['Planetary Lab Network','A lab on every world, comparing notes.',{i:1.4,gain:1.25}]],
   [['Matrioshka Brain','A star-sized computer. Insight beyond measure, at some cost to cohesion.',{i:2.2,c:.85}],['Unified Theory','The deepest rules of the universe, written down.',{i:1.6,adv:.8,luck:.1}]]]},
  {id:'C',name:'Craft',tag:'Make and build',tiers:[
   [['Cilia','Tiny oars that grip what feeds you.',{t:1.5}]],
   [['Crushing Bite','Bite harder, eat sooner.',{t:2}],['Armor Plating','Slower, but safer. Traits cost less.',{g:.9,bad:.8}]],
   [['Grasping Paws','Hands that make things.',{g:.88,t:1.5}]],
   [['Bronze Tools','Metal outlasts bone.',{g:.82}],['The Wheel','Move more with less.',{t:2,e:1.1}]],
   [['Mass Production','A thousand identical parts.',{g:.75}]],
   [['Reusable Rockets','The same ship, again and again.',{g:.65,adv:.92}],['Space Elevator','A thread to the sky.',{t:3,e:1.3}]],
   [['Asteroid Mining','Build with whole mountains of metal.',{g:.7,e:1.15}],['Fusion Torches','Fast ships between worlds.',{t:3,e:1.2}]],
   [['Von Neumann Swarms','Machines that build more machines.',{g:.6,e:1.2}],['Stellar Engineering','Move planets, light stars.',{e:1.4,adv:.85}]]]}
 ]},
 civ:{name:'Society',res:'Cohesion',verb:'Adopt',gate:[1,3,5,7,9,10,11,12],c0:50,branches:[
  {id:'K',name:'Kinship',tag:'Who leads, who follows',tiers:[
   [['Quorum Sensing','Cells vote with chemistry.',{c:1.3,e:1.04}]],
   [['Parental Care','Guard the young. Bad events cost less.',{c:1.2,bad:.8}],['Territorial Display','Mark your range. Production up, cohesion down.',{e:1.15,c:.9}]],
   [['Band Councils','Elders settle disputes.',{c:1.3,e:1.06}]],
   [['Monarchy','One voice decides quickly.',{e:1.25,c:.9}],['Republic','Many voices, steadier hands.',{c:1.4,bad:.8}]],
   [['Public Education','Every child learns to read.',{i:1.35,c:1.2}]],
   [['World Federation','One planet, one table.',{c:1.6,e:1.15}],['Free Colonies','Let every colony choose for itself.',{e:1.4,c:.9}]],
   [['Colonial Charter','Each world keeps its own laws, under one promise.',{c:1.5,e:1.1}],['Council of Worlds','One table, with a signal delay.',{c:1.4,bad:.8}]],
   [['Long-Lived Elders','Leaders who remember a thousand years.',{c:1.5,i:1.3}],['Many Selves','Families that spread across many bodies.',{e:1.4,c:1.2}]]]},
  {id:'D',name:'Doctrine',tag:'What you believe',tiers:[
   [['Shared Signals','Chemical messages align the colony.',{i:1.15,c:1.15}]],
   [['Ritual Calls','Songs that bind a group.',{c:1.3}],['Wanderlust','Always scouting the next shore.',{i:1.3,c:.9}]],
   [['Burial Rites','The dead are remembered.',{c:1.4}]],
   [['Organized Religion','Shared myth, shared purpose.',{c:1.5,adv:.92}],['Philosophy','Question everything.',{i:1.5,c:.95}]],
   [['Universal Rights','Every voice counts.',{c:1.3,e:1.12}]],
   [['Cosmic Perspective','One small world seen from orbit.',{c:1.5,i:1.3}],['Frontier Spirit','To the stars, whatever the cost.',{e:1.35,adv:.85,bad:1.2}]],
   [['Terraform Ethics','What do we owe the worlds we change?',{c:1.4,bad:.85}],['Manifest Destiny','The universe was made to be settled.',{e:1.3,adv:.88}]],
   [['Stellar Faith','Worship the star that feeds you all.',{c:1.7,e:1.1}],['Meaning Beyond Matter','Look inward when everything else is solved.',{c:1.4,i:1.4,luck:.1}]]]},
  {id:'X',name:'Exchange',tag:'How you share',tiers:[
   [['Symbiosis','Trade favors between cells.',{e:1.1,c:1.1}]],
   [['Food Sharing','Share the catch, strengthen the bond.',{c:1.2,e:1.06}],['Hoarding','Keep what you find.',{e:1.2,c:.85}]],
   [['Barter','Swap a stone for a hide.',{e:1.1,gain:1.2}]],
   [['Markets','Coin makes strangers cooperate.',{e:1.25}],['Guilds','Craft secrets, carefully protected.',{g:.82,c:1.1}]],
   [['Global Trade','Goods cross every ocean.',{e:1.3,gain:1.2}]],
   [['Post-scarcity Economy','Make abundance the default.',{e:1.5,c:.9}],['Orbital Commons','Shared rights to shared space.',{c:1.4,g:.8}]],
   [['Interplanetary Markets','Trade across light-minutes.',{e:1.35,gain:1.2}],['Resource Commons','Shared claims on shared worlds.',{c:1.4,g:.85}]],
   [['Energy Currency','Money is measured in watts.',{e:1.6}],['Gift Economy','Abundance makes giving the rule.',{c:1.5,e:1.2}]]]}
 ]}
};
const NODES={tech:{},civ:{}};
['tech','civ'].forEach(kind=>{
  const T=TREES[kind];
  T.cost=T.gate.map(g=>Math.round(T.c0*Math.pow(2.8,g)));
  T.branches.forEach(b=>{b.tiers=b.tiers.map((opts,t)=>opts.map((o,k)=>{
    const n={id:b.id+t+(opts.length>1?'ab'[k]:''),kind:kind,branch:b.id,tier:t,fork:opts.length>1,n:o[0],d:o[1],fx:o[2]};
    NODES[kind][n.id]=n;return n;}));});
});
const FXN={e:'Production',t:'Tap',i:'Insight',c:'Cohesion',g:'Trait cost',adv:'Evolution cost',bad:'Event losses',gain:'Event gains',buffd:'Buff time'};
function fxText(fx){return Object.keys(fx).map(k=>k==='luck'?'Gamble odds +'+Math.round(fx[k]*100)+'%':FXN[k]+' ×'+fx[k]).join(' · ');}
const resKey=kind=>kind==='tech'?'ins':'coh';
function mods(S){
  const m={e:1,t:1,i:1,c:1,g:1,adv:1,luck:0,bad:1,gain:1,buffd:1,upg:1};
  const add=fx=>{if(!fx)return;for(const k in fx){if(k==='luck')m.luck+=fx[k];else m[k]*=fx[k];}};
  const f=FOCUS[(S.focus==='society'&&S.era<1)?'balanced':S.focus]||FOCUS.balanced;
  m.e*=f.e;m.i*=f.i;m.c*=f.c;
  if(S.approach&&APPROACH[S.approach])add(APPROACH[S.approach].fx);
  if(S.lineage&&LINEAGES[S.lineage])add(LINEAGES[S.lineage].fx);
  for(const id in S.tech)if(S.tech[id]&&NODES.tech[id])add(NODES.tech[id].fx);
  for(const id in S.civ)if(S.civ[id]&&NODES.civ[id])add(NODES.civ[id].fx);
  S.marks.forEach(k=>add(MARKS[k]&&MARKS[k].fx));
  if(typeof lifeFx==='function')add(lifeFx(S));
  if(S.path&&typeof pathFx==='function')add(pathFx(S));
  if(typeof perkFx==='function')add(perkFx(S));
  if(typeof formFx==='function')add(formFx(S));
  return m;
}
function advCostFor(S){return advCost(S.era)*mods(S).adv;}
function mindBase(S){return 0.1*Math.pow(2.5,S.era)*(1+ownedIn(S,S.era)/8);}
function insightPerSec(S){return mindBase(S)*mods(S).i*(S.buff.left>0?S.buff.m:1);}
function cohPerSec(S){return S.era<1?0:mindBase(S)*0.9*mods(S).c*(S.buff.left>0?S.buff.m:1);}
function nodeState(S,n){
  const T=TREES[n.kind],own=S[n.kind],cost=Math.round(T.cost[n.tier]*(1+0.25*Object.keys(own).length));
  if(own[n.id])return {st:'owned',cost:0};
  const gate=T.gate[n.tier];
  if(S.era<gate)return {st:'locked',why:'Stage '+(gate+1)+': '+ERAS[gate].name,cost:cost};
  const b=T.branches.find(x=>x.id===n.branch);
  if(n.tier>0&&!b.tiers[n.tier-1].some(p=>own[p.id]))return {st:'locked',why:'Needs the step before it',cost:cost};
  const sib=n.fork?b.tiers[n.tier].find(p=>p.id!==n.id&&own[p.id]):null;
  if(sib)return {st:'switch',cost:Math.round(cost*0.6),sib:sib.id};
  return {st:'ok',cost:cost};
}
function buyNode(S,kind,id){
  const n=NODES[kind][id];if(!n)return false;const st=nodeState(S,n);
  if(st.st!=='ok'&&st.st!=='switch')return false;
  const k=resKey(kind);if(S[k]<st.cost)return false;
  S[k]-=st.cost;if(st.sib)delete S[kind][st.sib];S[kind][id]=true;
  return st.st;
}
function affordableNodes(S,kind){
  let c=0;for(const id in NODES[kind]){const n=NODES[kind][id];if(S[kind][id])continue;const s=nodeState(S,n);if(s.st==='ok'&&S[resKey(kind)]>=s.cost)c++;}return c;
}
function character(S){
  const tally={};
  ['tech','civ'].forEach(kind=>{for(const id in S[kind])if(S[kind][id]&&NODES[kind][id]){const b=NODES[kind][id].branch;tally[b]=(tally[b]||0)+1;}});
  const ADJ={S:'provident',M:'curious',C:'industrious',K:'close-knit',D:'reflective',X:'enterprising'};
  return {adj:Object.keys(tally).sort((a,b)=>tally[b]-tally[a]).slice(0,2).map(k=>ADJ[k]),marks:S.marks.slice(-3).map(k=>MARKS[k].n.toLowerCase())};
}
function eligibleEvents(S){
  return EVENTS.filter(ev=>S.era>=ev.eras[0]&&S.era<=ev.eras[1]&&!(ev.once&&S.seen[ev.id])&&!(ev.need&&!S[ev.need[0]][ev.need[1]]));
}
function pickEvent(S){
  const pool=eligibleEvents(S);if(!pool.length)return null;
  const w=pool.map(ev=>ev.once?4:1);let r=Math.random()*w.reduce((a,b)=>a+b,0);
  for(let i=0;i<pool.length;i++){r-=w[i];if(r<=0)return pool[i];}
  return pool[pool.length-1];
}
const DESTS=[
 {n:'Proxima Centauri',d:'The nearest star. A short, bright gamble.',title:'A short road to a new sun',t:'Four light-years later, a small red sun warms a young world, and your descendants light their first fires on it.'},
 {n:'Tau Ceti',d:'Farther and steadier, with room to grow.',title:'A long, quiet road',t:'Centuries pass in the dark. The Ark arrives at a calm star with plenty of room, and your descendants take their time.'},
 {n:'The dark between stars',d:'No destination. Let the Ark become a world of its own.',title:'A world that never lands',t:'The Ark never lands. Generations are born, live and die in the long dark, and call it home.'}
];
EVENTS.push(
{eras:[11,12],title:'A colony goes dark',text:'Contact with a distant settlement has stopped. Its beacon still blinks, slowly.',opts:[
 {l:'Send the relief fleet',d:'Costs 10% of your stock. Gain cohesion.',fx:[{lose:.1},{coh:90}]},
 {l:'Let them fend for themselves',d:'A small gain, and a quiet guilt.',fx:[{gain:50}]}]},
{eras:[11,12],title:'A rich asteroid',text:'A survey drone has found a tumbling mountain of metal and ice.',opts:[
 {l:'Mine it at once',d:'70% chance of a rich haul, otherwise you lose 15%.',fx:[{risk:.7,win:[{gain:240}],fail:[{lose:.15}]}]},
 {l:'Sell the claim',d:'A safe, small gain.',fx:[{gain:80}]}]},
{eras:[11,12],title:'The settlers disagree',text:'Two worlds want different things, and the signal delay makes every argument slow.',opts:[
 {l:'Call a council of worlds',d:'Gain cohesion.',fx:[{coh:110}]},
 {l:'Let each world choose',d:'Gain insight from many experiments.',fx:[{ins:80}]}]},
{eras:[12,12],title:'A solar flare surge',text:'The star is restless today, and every collector in its light is straining.',opts:[
 {l:'Fold the sails',d:'Costs 10% of your stock. Safe.',fx:[{lose:.1}]},
 {l:'Ride the surge',d:'60% chance everything runs 1.5× faster for 50 seconds, otherwise you lose 20%.',fx:[{risk:.6,win:[{buff:[1.5,50]}],fail:[{lose:.2}]}]}]},
{id:'implant',once:true,eras:[11,12],title:'The first implants',text:'A surgeon offers a neural lace that joins a person straight to the network. Others say the future belongs to machines that need no bodies at all.',opts:[
 {l:'Embrace the implants',d:'Gain insight. Marks you as Bold. Your people lean toward cybernetics.',fx:[{ins:110},{mark:'bold'},{lean:'cyborg'}]},
 {l:'Build machines instead',d:'A rich gain. Your people lean toward machine bodies.',fx:[{gain:160},{lean:'machine'}]},
 {l:'Keep bodies as they are',d:'Gain cohesion. Marks you as Cautious. Your people lean toward staying natural.',fx:[{coh:120},{mark:'cautious'},{lean:'natural'}]}]},
{id:'genelab',once:true,eras:[11,12],title:'A garden of new genomes',text:'A lab on a moon has grown people with rewritten bodies. They breathe thin air and hardly age. Nearby, a child claims to hear what others only imagine.',opts:[
 {l:'Rewrite the genome',d:'Gain insight. Your people lean toward engineered evolution.',fx:[{ins:120},{lean:'genetic'}]},
 {l:'Listen to the child',d:'Gain cohesion. Marks you as Devout. Your people lean toward the mind.',fx:[{coh:150},{mark:'pious'},{lean:'psionic'}]}]},
{id:'mindcopy',once:true,eras:[12,12],title:'A copy of a mind',text:'A dying scientist has been copied into a machine. The copy wakes, remembers everything, and asks to stay.',opts:[
 {l:'Welcome it as a person',d:'Gain insight. Marks you as Curious. Your people lean toward uploading.',fx:[{ins:150},{mark:'curious'},{lean:'digital'}]},
 {l:'Treat it as software',d:'A rich gain. Marks you as Skeptics. Your people lean toward machines.',fx:[{gain:200},{mark:'rational'},{lean:'machine'}]},
 {l:'Delete the copy',d:'Gain cohesion. Marks you as Devout. Your people lean toward staying natural.',fx:[{coh:110},{mark:'pious'},{lean:'natural'}]}]},
{id:'whisper',once:true,eras:[12,12],title:'The whispering ones',text:'Some of your people say they can hear each other without speaking. No instrument detects anything. The effect gets stronger the closer they sit.',opts:[
 {l:'Train it',d:'Gain cohesion. Your people lean toward the mind.',fx:[{coh:200},{lean:'psionic'}]},
 {l:'Study it with instruments',d:'Gain insight. Your people lean toward engineered evolution.',fx:[{ins:100},{lean:'genetic'}]},
 {l:'Call it a trick of the mind',d:'A small gain. Marks you as Skeptics.',fx:[{gain:90},{mark:'rational'}]}]},
{id:'mutation',once:true,eras:[0,2],title:'A strange mutation',text:'One of your descendants carries a change no one has seen before. It thrives, but it is different.',opts:[
 {l:'Encourage it',d:'60% chance it pays off, otherwise you lose 15%. Marks you as Curious.',fx:[{risk:.6,win:[{ins:60}],fail:[{lose:.15}]},{mark:'curious'}]},
 {l:'Suppress it',d:'Keep what works. A small gain. Marks you as Cautious.',fx:[{gain:40},{mark:'cautious'}]}]},
{id:'migration',once:true,eras:[3,5],title:'The great migration',text:'The herds are moving, and the old feeding grounds are drying up.',opts:[
 {l:'Follow the herds',d:'A rich journey. Marks you as Wanderers.',fx:[{gain:120},{mark:'wanderer'}]},
 {l:'Hold the territory',d:'Everything runs 1.4× faster for 60 seconds. Marks you as Rooted.',fx:[{buff:[1.4,60]},{mark:'rooted'}]}]},
{id:'rival',once:true,eras:[5,6],title:'A rival band',text:'Another group has found your water hole. Their children are thin and watchful.',opts:[
 {l:'Share the water',d:'Costs 10% of your stock. Gain cohesion. Marks you as Merciful.',fx:[{lose:.1},{coh:90},{mark:'merciful'}]},
 {l:'Drive them off',d:'60% chance of a clean win, otherwise you lose 20%. Marks you as Ruthless.',fx:[{risk:.6,win:[{gain:240}],fail:[{lose:.2}]},{mark:'ruthless'}]},
 {l:'Study their tools',d:'Gain insight from watching. Marks you as Curious.',fx:[{ins:120},{mark:'curious'}]}]},
{id:'burial',once:true,eras:[5,6],title:'The first burial',text:'A member of the band has died. The others do not want to leave the body behind.',opts:[
 {l:'Hold a ceremony',d:'Gain cohesion. Marks you as Devout.',fx:[{coh:140},{mark:'pious'}]},
 {l:'Move on at once',d:'No delay. A small gain. Marks you as Skeptics.',fx:[{gain:80},{mark:'rational'}]}]},
{id:'famine',once:true,eras:[6,8],title:'A failed harvest',text:'Rain did not come. The granaries are half empty and the winter is long.',opts:[
 {l:'Open the granaries',d:'Costs 20% of your stock. Gain cohesion. Marks you as Generous.',fx:[{lose:.2},{coh:150},{mark:'generous'}]},
 {l:'Ration by rank',d:'Safe. A small gain. Marks you as Hoarders.',fx:[{gain:60},{mark:'greedy'}]},
 {l:'Send raiders',d:'50% chance of a big haul, otherwise you lose 30%. Marks you as Ruthless.',fx:[{risk:.5,win:[{gain:320}],fail:[{lose:.3}]},{mark:'ruthless'}]}]},
{id:'heretic',once:true,eras:[7,8],title:'A heretic scholar',text:'A scholar claims the heavens do not move as the priests say. The crowds are listening.',opts:[
 {l:'Protect the scholar',d:'Gain insight. Marks you as Curious.',fx:[{ins:200},{mark:'curious'}]},
 {l:'Silence the scholar',d:'Gain cohesion. Marks you as Devout.',fx:[{coh:200},{mark:'pious'}]},
 {l:'Exile quietly',d:'Neither gain nor loss. Marks you as Cautious.',fx:[{mark:'cautious'}]}]},
{id:'revolt',once:true,eras:[7,9],title:'The people revolt',text:'Bread is dear, taxes are heavy, and a crowd has gathered outside the gates.',opts:[
 {l:'Grant reforms',d:'Costs 12% of your stock. Gain cohesion. Marks you as Merciful.',fx:[{lose:.12},{coh:180},{mark:'merciful'}]},
 {l:'Crush the revolt',d:'60% chance of calm, otherwise you lose 25%. Marks you as Ruthless.',fx:[{risk:.6,win:[{gain:260}],fail:[{lose:.25}]},{mark:'ruthless'}]}]},
{id:'inventor',once:true,eras:[8,9],title:'A reckless inventor',text:'She wants funds for a machine nobody understands. It could change everything, or burn down the district.',opts:[
 {l:'Fund the experiment',d:'50% chance of a breakthrough, otherwise you lose 20%. Marks you as Bold.',fx:[{risk:.5,win:[{ins:300},{buff:[1.6,60]}],fail:[{lose:.2}]},{mark:'bold'}]},
 {l:'License the patents',d:'Safe. A steady gain.',fx:[{gain:140}]},
 {l:'Regulate it first',d:'Gain a little insight. Marks you as Cautious.',fx:[{ins:80},{mark:'cautious'}]}]},
{id:'strike',once:true,eras:[8,8],title:'The factory strike',text:'The workers have stopped the machines and the owners are demanding action.',opts:[
 {l:'Raise wages',d:'Costs 12% of your stock. Gain cohesion. Marks you as Generous.',fx:[{lose:.12},{coh:200},{mark:'generous'}]},
 {l:'Hire strikebreakers',d:'A large haul. Marks you as Hoarders.',fx:[{gain:240},{mark:'greedy'}]}]},
{id:'signal',once:true,eras:[9,10],title:'A strange signal',text:'A repeating pattern in the radio noise. It could be natural. It could be someone.',opts:[
 {l:'Reply',d:'50% chance of a leap in understanding, otherwise you lose 15%. Marks you as Bold.',fx:[{risk:.5,win:[{ins:600},{coh:300}],fail:[{lose:.15}]},{mark:'bold'}]},
 {l:'Stay silent',d:'Safe. A small gain. Marks you as Cautious.',fx:[{gain:100},{mark:'cautious'}]},
 {l:'Listen and study',d:'Gain insight. Marks you as Curious.',fx:[{ins:250},{mark:'curious'}]}]},
{id:'monopoly',once:true,need:['civ','X3a'],eras:[7,9],title:'The merchants demand a monopoly',text:'Your markets have grown rich. The guild offers a fortune for the sole right to trade salt and iron.',opts:[
 {l:'Grant the monopoly',d:'A large gain. Marks you as Hoarders.',fx:[{gain:260},{mark:'greedy'}]},
 {l:'Keep trade open',d:'Gain cohesion. Marks you as Generous.',fx:[{coh:220},{mark:'generous'}]}]},
{id:'prophet',once:true,need:['civ','D3a'],eras:[7,9],title:'A prophet in the square',text:'Your faith has taken root. A prophet promises a better world, and the faithful follow without question.',opts:[
 {l:'Welcome the prophet',d:'Gain cohesion. Marks you as Devout.',fx:[{coh:260},{mark:'pious'}]},
 {l:'Question the prophet',d:'Gain insight. Marks you as Skeptics.',fx:[{ins:200},{mark:'rational'}]}]},
{id:'labfire',once:true,need:['tech','M4'],eras:[8,10],title:'The laboratory fire',text:'A fire has torn through the great laboratory. Years of notes are ash, but the survivors are already sketching.',opts:[
 {l:'Rebuild bigger',d:'Costs 15% of your stock. Then 1.6× faster for 60 seconds.',fx:[{lose:.15},{buff:[1.6,60]}]},
 {l:'Share what remains',d:'Gain cohesion and insight.',fx:[{coh:200},{ins:200}]}]}
);

const SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
function fmt(n,dec){
  if(!isFinite(n))return '∞';
  if(n<0)return '-'+fmt(-n,dec);
  if(n<1000){if(!dec)return String(Math.floor(n));return String(+(n>=100?n.toFixed(0):n.toFixed(dec)));}
  let i=Math.floor(Math.log10(n)/3);
  const show=(k)=>{const v=n/Math.pow(1000,k);return v<10?v.toFixed(2):v<100?v.toFixed(1):v.toFixed(0);};
  if(i<SUF.length-1&&parseFloat(show(i))>=1000)i++; // 999.7M must read 1.00B, not 1000M
  if(i>=SUF.length)return n.toExponential(2).replace('e+','e');
  return show(i)+SUF[i];
}

const GR=1.15;
const gk=(e,i)=>e+'-'+i;
function newState(){const S={v:1,name:'Luma',era:0,energy:0,total:0,taps:0,gens:{},upg:{},lineage:null,play:0,buff:{m:1,left:0},evt:45,log:[],won:false,saved:Date.now(),ins:0,coh:0,tech:{},civ:{},focus:'balanced',approach:null,marks:[],seen:{},path:null,lean:{},dest:null,perks:{},form:(typeof randomForm==='function'?randomForm():null)};if(typeof lifeInit==='function')lifeInit(S);return S;}
function genBase(e,i){return 15*Math.pow(8,e)*Math.pow(7,i);}
function genRate(e,i){return 0.4*Math.pow(8,e)*Math.pow(6,i);}
function upgCost(S,e,j){return [120,650,3500][j]*Math.pow(8,e)*mods(S).upg;}
function advCost(e){return ERAS[e].adv*Math.pow(8,e);}
function eraMult(S,e,i){let m=1;ERAS[e].upg.forEach((u,j)=>{if(S.upg[gk(e,j)]){if(u.k==='all')m*=1.6;else if(u.k==='gen'&&u.i===i)m*=2.5;}});return m;}
function globalMult(S){return Math.pow(1.12,S.era)*mods(S).e*(S.buff.left>0?S.buff.m:1);}
function perSec(S){let s=0;for(let e=0;e<=S.era;e++)for(let i=0;i<3;i++){const n=S.gens[gk(e,i)]||0;if(n)s+=n*genRate(e,i)*eraMult(S,e,i);}return s*globalMult(S);}
function tapVal(S){let m=Math.pow(8,S.era)*mods(S).t*(S.buff.left>0?S.buff.m:1);ERAS[S.era].upg.forEach((u,j)=>{if(u.k==='tap'&&S.upg[gk(S.era,j)])m*=3;});return m+perSec(S)*0.04;}
function ownedIn(S,e){let n=0;for(let i=0;i<3;i++)n+=S.gens[gk(e,i)]||0;return n;}
function genCost(S,e,i,k){const n=S.gens[gk(e,i)]||0;return genBase(e,i)*mods(S).g*Math.pow(GR,n)*(Math.pow(GR,k)-1)/(GR-1);}
function maxBuy(S,e,i){const n=S.gens[gk(e,i)]||0;const c=genBase(e,i)*mods(S).g*Math.pow(GR,n);let k=Math.max(0,Math.floor(Math.log(1+S.energy*(GR-1)/c)/Math.log(GR)));while(k>0&&genCost(S,e,i,k)>S.energy)k--;return k;}
/* What the player owns, in the shape the scenes in art.js expect:
   a: adaptations bought this stage (0/1), g: trait counts this stage,
   n: owned tech and civic node ids, b: owned nodes per branch. */
function lookOf(S){
  const a=[0,1,2].map(j=>S.upg[gk(S.era,j)]?1:0);
  const g=[0,1,2].map(i=>S.gens[gk(S.era,i)]||0);
  const n={},b={S:0,M:0,C:0,K:0,D:0,X:0};
  ['tech','civ'].forEach(kind=>{for(const id in S[kind])if(S[kind][id]&&NODES[kind][id]){n[id]=1;b[NODES[kind][id].branch]++;}});
  const r={a:a,g:g,n:n,b:b,flash:0,path:S.path||null,perks:S.perks||{},lean:S.lean||{},form:(S.era>=5?S.form:null)||null,era:S.era};if(typeof lifeLook==='function'&&S.life)Object.assign(r,lifeLook(S));return r;
}
function buyGen(S,e,i,mode){const k=mode==='max'?maxBuy(S,e,i):mode;if(k<1)return false;const cost=genCost(S,e,i,k);if(S.energy<cost)return false;S.energy-=cost;S.gens[gk(e,i)]=(S.gens[gk(e,i)]||0)+k;return true;}
function buyUpg(S,e,j){if(S.upg[gk(e,j)])return false;const cost=upgCost(S,e,j);if(S.energy<cost)return false;S.energy-=cost;S.upg[gk(e,j)]=true;return true;}
function canEvolve(S){return S.energy>=advCostFor(S)&&!(S.era===ERAS.length-1&&S.won)&&!(S.life&&S.life.ended)&&(typeof geoReady!=='function'||geoReady(S));}
function doEvolve(S){if(!canEvolve(S))return 0;S.energy-=advCostFor(S);if(S.era===ERAS.length-1){S.won=true;return 2;}S.era++;S.approach=null;if(typeof lifeOnEvolve==='function')lifeOnEvolve(S);return 1;}
function tick(S,dt){const ps=perSec(S);S.energy+=ps*dt;S.total+=ps*dt;S.ins+=insightPerSec(S)*dt;S.coh+=cohPerSec(S)*dt;S.play+=dt;if(S.buff.left>0)S.buff.left=Math.max(0,S.buff.left-dt);S.evt-=dt;if(typeof lifeTick==='function')lifeTick(S,dt);}
function applyFx(S,fx){
  const out=[],m=mods(S);
  for(const f of fx){
    if(f.gain){const a=Math.max(perSec(S)*f.gain,tapVal(S)*f.gain/4)*m.gain;S.energy+=a;S.total+=a;out.push('Gained '+fmt(a)+' '+ERAS[S.era].unit+'.');}
    else if(f.ins){const a=insightPerSec(S)*f.ins;S.ins+=a;out.push('Gained '+fmt(a)+' insight.');}
    else if(f.coh){const a=cohPerSec(S)*f.coh;S.coh+=a;if(a>0)out.push('Gained '+fmt(a)+' cohesion.');}
    else if(f.mark){if(S.marks.indexOf(f.mark)<0){S.marks.push(f.mark);out.push('Your people are now known as '+MARKS[f.mark].n+'.');}else out.push('Your reputation as '+MARKS[f.mark].n+' deepens.');}
    else if(f.lean){S.lean=S.lean||{};S.lean[f.lean]=(S.lean[f.lean]||0)+1;out.push('Your people lean toward '+(typeof PATHS!=='undefined'&&PATHS[f.lean]?PATHS[f.lean].lean:'a new path')+'.');}
    else if(f.lose){const a=S.energy*f.lose*m.bad;S.energy-=a;out.push('Lost '+fmt(a)+' '+ERAS[S.era].unit+'.');}
    else if(f.buff){if(S.buff.left<=0||f.buff[0]>S.buff.m)S.buff.m=f.buff[0];const secs=Math.round(f.buff[1]*m.buffd);S.buff.left=Math.max(S.buff.left,secs);out.push('Everything runs '+f.buff[0]+'× faster for '+secs+' seconds.');}
    else if(f.risk!==undefined){const ok=Math.random()<Math.min(.95,f.risk+m.luck);out.push(...applyFx(S,ok?f.win:f.fail));}
  }
  return out;
}
