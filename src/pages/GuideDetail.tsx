import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import styles from './GuideDetail.module.css'

// Guide content - in production this would come from a CMS
const guideContent: Record<string, { title: string; content: string; isPremium: boolean }> = {
  'outdoor-safety': {
    title: 'Outdoor Safety Essentials',
    isPremium: false,
    content: `
# Outdoor Safety Essentials

Before heading into the wilderness, proper preparation can mean the difference between a memorable adventure and a dangerous situation.

## The Ten Essentials

1. **Navigation** - Map, compass, and GPS device
2. **Sun Protection** - Sunglasses, sunscreen, and hat
3. **Insulation** - Extra clothing layers
4. **Illumination** - Headlamp with extra batteries
5. **First Aid Kit** - Including personal medications
6. **Fire** - Matches, lighter, and fire starters
7. **Repair Tools** - Knife, duct tape, and gear repair kit
8. **Nutrition** - Extra food beyond what you plan to eat
9. **Hydration** - Extra water and purification method
10. **Emergency Shelter** - Bivy, space blanket, or tarp

## Before You Go

- Tell someone your plans and expected return time
- Check weather forecasts and trail conditions
- Know your limits and plan accordingly
- Carry emergency contact information

## On the Trail

- Stay on marked trails when possible
- Keep your group together
- Turn back if conditions worsen
- Trust your instincts - if something feels wrong, it probably is

## Emergency Situations

If you become lost or injured:
1. Stay calm and assess the situation
2. Stay put if possible - moving makes rescue harder
3. Signal for help (whistle, mirror, fire)
4. Conserve energy and stay warm
5. Make yourself visible from the air
    `,
  },
  'navigation-basics': {
    title: 'Navigation Without GPS',
    isPremium: false,
    content: `
# Navigation Without GPS

While GPS devices are incredibly useful, knowing how to navigate without them is an essential outdoor skill.

## Using a Map and Compass

### Reading a Topographic Map
- **Contour lines** show elevation changes
- Lines close together = steep terrain
- Lines far apart = gentle slopes
- Learn to identify features: ridges, valleys, saddles

### Compass Basics
- **Magnetic North** vs **True North** - know the declination for your area
- Hold the compass level and steady
- Take bearings by pointing the direction-of-travel arrow at your target

## Natural Navigation

### Using the Sun
- Sun rises in the east, sets in the west
- At midday in the Northern Hemisphere, the sun is due south
- Shadow sticks can help determine direction

### Using the Stars
- **Polaris (North Star)** indicates true north
- Find it using the Big Dipper's "pointer stars"
- Southern Cross points south in the Southern Hemisphere

### Using Nature
- Moss often grows on the north side of trees (in Northern Hemisphere)
- Spider webs are often built on the south side of trees
- Snow melts faster on south-facing slopes

## Practice Makes Perfect

- Practice navigation in familiar areas first
- Take a navigation course
- Always carry backup navigation tools
    `,
  },
  'wildlife-awareness': {
    title: 'Wildlife Awareness',
    isPremium: false,
    content: `
# Wildlife Awareness

Encountering wildlife is one of the joys of outdoor adventures, but it's important to do so safely and responsibly.

## General Guidelines

- **Observe from a distance** - Use binoculars or a zoom lens
- **Never feed wildlife** - It's dangerous for both you and the animals
- **Store food properly** - Use bear canisters or hang food in trees
- **Make noise** - Alert animals to your presence on trails

## Bear Safety

### Prevention
- Make noise while hiking
- Travel in groups
- Carry bear spray and know how to use it
- Store food in bear-proof containers

### If You Encounter a Bear
- **Black Bears**: Make yourself large, make noise, don't run
- **Grizzly Bears**: Speak calmly, back away slowly, play dead if attacked
- **Never run** - Bears can outrun humans

## Other Wildlife

### Snakes
- Watch where you step and put your hands
- Give them space to retreat
- Most bites occur when people try to handle snakes

### Mountain Lions
- Make yourself appear large
- Maintain eye contact
- Don't run or turn your back
- Fight back if attacked

### Moose
- More dangerous than bears in some areas
- Give them plenty of space
- Never get between a cow and calf
    `,
  },
  'leave-no-trace': {
    title: 'Leave No Trace Principles',
    isPremium: false,
    content: `
# Leave No Trace Principles

The Leave No Trace principles help us enjoy the outdoors responsibly while preserving nature for future generations.

## The Seven Principles

### 1. Plan Ahead and Prepare
- Know the regulations for your destination
- Prepare for extreme weather and emergencies
- Schedule trips to avoid high-use times
- Visit in small groups

### 2. Travel and Camp on Durable Surfaces
- Stick to established trails and campsites
- Walk single file in the middle of the trail
- Camp at least 200 feet from lakes and streams
- Protect riparian areas

### 3. Dispose of Waste Properly
- Pack out all trash, including food scraps
- Use established toilets when available
- Bury human waste in catholes 6-8 inches deep
- Pack out toilet paper and hygiene products

### 4. Leave What You Find
- Don't pick flowers or collect natural objects
- Don't build structures or dig trenches
- Leave rocks, plants, and artifacts as you found them

### 5. Minimize Campfire Impacts
- Use established fire rings when available
- Keep fires small
- Burn all wood to ash and scatter cool ashes
- Consider using a camp stove instead

### 6. Respect Wildlife
- Observe from a distance
- Never feed animals
- Store food and trash securely
- Control pets at all times

### 7. Be Considerate of Others
- Respect other visitors
- Take breaks away from trails
- Let nature's sounds prevail
- Yield to other users on the trail
    `,
  },
  'weather-reading': {
    title: 'Reading Weather Signs',
    isPremium: true,
    content: `
# Reading Weather Signs

Understanding natural weather indicators can help you make better decisions in the backcountry.

## Cloud Types and What They Mean

### High Clouds (Cirrus)
- Wispy, feathery appearance
- Generally indicate fair weather
- If increasing, may signal approaching front

### Middle Clouds (Alto)
- Gray or blue-gray sheets
- May produce light precipitation
- Often precede storms

### Low Clouds (Stratus/Cumulus)
- Cumulus = fair weather "cotton balls"
- Towering cumulus = potential thunderstorms
- Dark, anvil-shaped = severe weather possible

## Pressure Changes

### Falling Pressure
- Clouds increasing
- Wind shifting or increasing
- Storm likely approaching

### Rising Pressure
- Clouds clearing
- Wind decreasing
- Fair weather coming

## Natural Indicators

### Animal Behavior
- Birds flying low = low pressure, rain coming
- Insects more active before storms
- Frogs croaking more = rain approaching

### Plant Signs
- Pine cones close before rain
- Leaves showing undersides = wind and rain coming
- Flowers closing = moisture in air

## Mountain Weather

- Weather changes rapidly at altitude
- Afternoon thunderstorms common in summer
- Clouds forming on peaks = stay below treeline
- "When thunder roars, go indoors" (or below treeline)
    `,
  },
  'gear-essentials': {
    title: 'Gear Essentials Guide',
    isPremium: true,
    content: `
# Gear Essentials Guide

Choosing the right gear can make your outdoor adventures safer and more enjoyable.

## Layering System

### Base Layer
- Moisture-wicking material (merino wool or synthetic)
- Avoid cotton - it stays wet
- Fit should be snug but not restrictive

### Mid Layer
- Insulation (fleece, down, or synthetic)
- Adjust based on activity level and temperature
- Consider packability for variable conditions

### Outer Layer
- Waterproof and breathable
- Wind protection
- Pit zips for ventilation

## Footwear

### Choosing Boots
- Match to your activity (hiking, backpacking, mountaineering)
- Break them in before long trips
- Consider waterproofing needs

### Socks
- Wool or synthetic blends
- Avoid cotton
- Bring extra pairs

## Backpacks

### Day Hikes (15-30L)
- Room for essentials
- Hip belt for comfort
- Hydration compatible

### Overnight (40-65L)
- Frame for load support
- Multiple compartments
- Rain cover included or available

### Extended Trips (65L+)
- Maximum capacity
- Durable construction
- Adjustable suspension

## Sleep System

### Sleeping Bags
- Temperature rating for conditions
- Down vs synthetic fill
- Shape (mummy, rectangular, quilt)

### Sleeping Pads
- R-value for insulation
- Inflatable vs foam
- Size and weight considerations

## Navigation Tools

- Topographic maps of your area
- Compass (learn to use it!)
- GPS device or phone app (with offline maps)
- Extra batteries or power bank
    `,
  },
  'emergency-shelter': {
    title: 'Emergency Shelter Building',
    isPremium: true,
    content: `
# Emergency Shelter Building

Knowing how to build an emergency shelter could save your life if you become stranded or lost.

## Shelter Priorities

1. **Protection from elements** - Wind, rain, snow, sun
2. **Insulation from ground** - Ground steals heat quickly
3. **Appropriate size** - Smaller = warmer
4. **Location** - Away from hazards, near resources

## Types of Emergency Shelters

### Debris Hut
Best for: Cold, dry conditions

1. Find a ridgepole (8-10 feet long)
2. Prop one end on a stump or rock (waist height)
3. Add ribs along both sides
4. Cover with leaves, grass, bark (3+ feet thick)
5. Line inside with dry leaves for insulation

### Lean-To
Best for: Quick construction, fire reflection

1. Find or create a horizontal support
2. Lean branches against it at 45-60 degrees
3. Cover with debris, bark, or tarp
4. Build fire in front for warmth

### Snow Cave
Best for: Deep snow conditions

1. Find a deep snowdrift or dig into slope
2. Dig entrance below sleeping platform
3. Create ventilation hole in roof
4. Smooth interior to prevent drips
5. Mark entrance from outside

### Tarp Shelters
Best for: When you have a tarp/poncho

- A-frame: Ridge line between trees
- Lean-to: One edge high, one staked low
- Diamond: One corner up, diagonal corners staked

## Essential Tips

- Start early - shelter building takes longer than expected
- Stay dry - wet clothing dramatically increases heat loss
- Insulate from ground - use leaves, pine needles, or gear
- Make it small - body heat warms smaller spaces better
- Test before dark - make adjustments while you can see
    `,
  },
  'water-finding': {
    title: 'Finding & Purifying Water',
    isPremium: true,
    content: `
# Finding & Purifying Water

Water is essential for survival. Knowing how to find and purify it is a critical outdoor skill.

## Finding Water

### Natural Sources
- **Streams and rivers** - Flowing water is generally safer
- **Lakes and ponds** - Stagnant water needs more treatment
- **Springs** - Often the cleanest natural source
- **Rain collection** - Use tarps, leaves, or containers

### Signs of Water
- Green vegetation in dry areas
- Animal trails often lead to water
- Insects (especially bees) near water sources
- Birds flying low in the morning/evening
- Valley bottoms and low points

### Emergency Water Sources
- Dew collection from grass (use cloth)
- Plant transpiration bags
- Solar stills (dig hole, cover with plastic)
- Snow and ice (melt before drinking)

## Water Purification Methods

### Boiling
- Most reliable method
- Bring to rolling boil for 1 minute (3 minutes above 6,500 ft)
- Let cool before drinking
- Doesn't remove chemicals or particulates

### Chemical Treatment
- Iodine tablets or drops
- Chlorine dioxide (Aquamira, Potable Aqua)
- Follow package instructions for dosage and wait time
- Less effective in cold or murky water

### Filtration
- Pump filters (0.2 micron or smaller)
- Gravity filters for group use
- Squeeze filters (Sawyer, Katadyn)
- Removes bacteria and protozoa, not viruses

### UV Treatment
- SteriPEN and similar devices
- Effective against all pathogens
- Requires clear water and batteries
- Quick treatment time

## Best Practices

1. **Pre-filter** murky water through cloth
2. **Combine methods** for maximum safety
3. **Carry backup** purification methods
4. **Stay hydrated** - Don't ration water
5. **Know your area** - Some sources may have chemical contamination
    `,
  },
}

export default function GuideDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isPremium = useAppStore((state) => state.isPremium)

  const guide = id ? guideContent[id] : null

  if (!guide) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/guides')}>
            <ArrowLeft size={24} />
          </button>
        </header>
        <div className={styles.notFound}>
          <h2>Guide not found</h2>
          <Link to="/guides">Back to Guides</Link>
        </div>
      </div>
    )
  }

  if (guide.isPremium && !isPremium) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/guides')}>
            <ArrowLeft size={24} />
          </button>
        </header>
        <div className={styles.locked}>
          <Lock size={48} />
          <h2>Premium Content</h2>
          <p>Subscribe to unlock this guide and all premium content.</p>
          <Link to="/settings" className={styles.subscribeButton}>
            Subscribe Now
          </Link>
        </div>
      </div>
    )
  }

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    const lines = content.trim().split('\n')
    const elements: React.ReactNode[] = []
    let currentList: string[] = []
    let listType: 'ul' | 'ol' | null = null

    const flushList = () => {
      if (currentList.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul'
        elements.push(
          <ListTag key={elements.length} className={styles.list}>
            {currentList.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: formatText(item) }} />
            ))}
          </ListTag>
        )
        currentList = []
        listType = null
      }
    }

    const formatText = (text: string) => {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      if (trimmed.startsWith('# ')) {
        flushList()
        elements.push(<h1 key={index} className={styles.h1}>{trimmed.slice(2)}</h1>)
      } else if (trimmed.startsWith('## ')) {
        flushList()
        elements.push(<h2 key={index} className={styles.h2}>{trimmed.slice(3)}</h2>)
      } else if (trimmed.startsWith('### ')) {
        flushList()
        elements.push(<h3 key={index} className={styles.h3}>{trimmed.slice(4)}</h3>)
      } else if (trimmed.match(/^\d+\.\s/)) {
        if (listType !== 'ol') {
          flushList()
          listType = 'ol'
        }
        currentList.push(trimmed.replace(/^\d+\.\s/, ''))
      } else if (trimmed.startsWith('- ')) {
        if (listType !== 'ul') {
          flushList()
          listType = 'ul'
        }
        currentList.push(trimmed.slice(2))
      } else if (trimmed === '') {
        flushList()
      } else {
        flushList()
        elements.push(
          <p 
            key={index} 
            className={styles.paragraph}
            dangerouslySetInnerHTML={{ __html: formatText(trimmed) }}
          />
        )
      }
    })

    flushList()
    return elements
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/guides')}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>{guide.title}</h1>
      </header>

      <article className={styles.content}>
        {renderContent(guide.content)}
      </article>
    </div>
  )
}
