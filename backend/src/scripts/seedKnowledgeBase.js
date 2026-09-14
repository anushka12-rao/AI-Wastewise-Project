const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/database');
const { KnowledgeEntry } = require('../models/KnowledgeEntry');
const logger = require('../utils/logger');

const SEED_DATA = [
  {
    wasteCategory: 'WET_WASTE',
    wasteStream: 'WET_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Organic compostable food leftovers, fruit & vegetable peels, tea leaves, eggshells, and garden trimmings. Drain excess liquid before placing in the Green Bin. Do not enclose in non-biodegradable plastic bags. Ideal for home composting or municipal aerobic biomethanation processing.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (CPCB Solid Waste Rules 2016 draft)',
    sourceUrl: 'https://cpcb.nic.in/uploads/MSW/SWM_2016_WetWaste.pdf',
    sourceAuthority: 'Ministry of Housing and Urban Affairs (MoHUA) / CPCB',
    verified: false
  },
  {
    wasteCategory: 'PAPER',
    wasteStream: 'DRY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Clean office paper, newspapers, notebooks, envelopes, and paper flyers. Keep dry and unsoiled. Place in Blue Bin. Soiled, oiled, or wax-coated papers must not be mixed here.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Swachh Bharat Dry Waste Protocol)',
    sourceUrl: 'https://swachhbharatmission.ddws.gov.in/dry-waste-paper-guideline',
    sourceAuthority: 'Swachh Bharat Mission (Urban)',
    verified: false
  },
  {
    wasteCategory: 'CARDBOARD',
    wasteStream: 'DRY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Clean corrugated cardboard shipping boxes, cereal boxes, carton packaging. Flatten boxes to conserve space. Remove plastic tapes and metallic staples where feasible. Deposit in Blue Bin.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (National Resource Recovery Framework)',
    sourceUrl: 'https://mohua.gov.in/cardboard-recovery-guidance',
    sourceAuthority: 'Ministry of Environment, Forest and Climate Change (MoEFCC)',
    verified: false
  },
  {
    wasteCategory: 'PLASTIC_CONTAINER',
    wasteStream: 'DRY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Rigid plastic bottles, jugs, jars, shampoo bottles, detergent containers (PET 1, HDPE 2, PP 5). Empty and rinse clean of chemical or liquid residue. Flatten lightly and deposit in Blue Bin.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Plastic Waste Management Rules 2016/2022)',
    sourceUrl: 'https://cpcb.nic.in/plastic-containers-epr-guidelines',
    sourceAuthority: 'Central Pollution Control Board (CPCB)',
    verified: false
  },
  {
    wasteCategory: 'PLASTIC_PACKAGING',
    wasteStream: 'DRY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Soft plastic wrapping, clean grocery bags, bubble wraps, air pillows. Must be empty and dry. Place in Blue Bin for secondary sorting and pyrolysis/cement kiln co-processing.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (CPCB Multilayered & Flexible Plastic Protocol)',
    sourceUrl: 'https://cpcb.nic.in/flexible-packaging-norms',
    sourceAuthority: 'Central Pollution Control Board (CPCB)',
    verified: false
  },
  {
    wasteCategory: 'GLASS',
    wasteStream: 'DRY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Glass beverage bottles, sauce jars, cosmetic jars. Rinse residue thoroughly. If broken, wrap in thick newspaper and label clearly as "Broken Glass" to prevent injury to sanitation workers. Deposit in Blue Bin.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Urban Solid Waste Handling Advisory)',
    sourceUrl: 'https://mohua.gov.in/glass-waste-advisory',
    sourceAuthority: 'MoHUA Directorate of Sanitation',
    verified: false
  },
  {
    wasteCategory: 'METAL',
    wasteStream: 'DRY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Aluminum drink cans, steel food tins, metal caps, foil containers, brass fittings. Rinse clean and dry. Flatten cans to minimize collection volume. Deposit in Blue Bin for scrap metallurgic recycling.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Non-ferrous Scrap Segregation Standard)',
    sourceUrl: 'https://cpcb.nic.in/metal-recycling-standards',
    sourceAuthority: 'Ministry of Steel / CPCB',
    verified: false
  },
  {
    wasteCategory: 'TEXTILE',
    wasteStream: 'DRY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Discarded clothing, bedsheets, curtains, clean fabric scraps. Clean, dry textiles should be packed separately in dry waste for textile shredding or handed to local donation / thrift drives.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Circular Textile & Dry Segregation SOP)',
    sourceUrl: 'https://texmin.nic.in/circular-economy-textiles',
    sourceAuthority: 'Ministry of Textiles / MoEFCC',
    verified: false
  },
  {
    wasteCategory: 'FOOD_CONTAMINATED_PACKAGING',
    wasteStream: 'DRY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Greasy pizza boxes, oiled paper bags, food trays with sticky residue that cannot be washed. If heavily soaked with oil/cheese, separate the contaminated portion and divert to combustible refuse-derived fuel (RDF) or wet waste composting if organic-certified. Never mix soaked paper with clean recyclable paper.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Refuse Derived Fuel & Contaminated Fraction SOP)',
    sourceUrl: 'https://cpcb.nic.in/rdf-quality-norms',
    sourceAuthority: 'CPCB & Swachh Bharat Technical Advisory',
    verified: false
  },
  {
    wasteCategory: 'SANITARY_WASTE',
    wasteStream: 'SANITARY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Sanitary napkins, adult diapers, baby diapers, soiled cotton bandages, ear swabs, body fluid wipes. Must be securely wrapped in newspaper or biodegradable disposal pouches, marked with a prominent Red "X", and placed in the Sanitary / Red waste stream for high-temperature incineration.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Solid Waste Management Rules 2016 Rule 4(c))',
    sourceUrl: 'https://mohua.gov.in/swm-sanitary-waste-mandate',
    sourceAuthority: 'Ministry of Housing and Urban Affairs (MoHUA)',
    verified: false
  },
  {
    wasteCategory: 'DIAPER',
    wasteStream: 'SANITARY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Soiled infant or adult incontinence diapers. Scrape solid waste into toilet first if possible. Roll tightly, secure with tabs, wrap in thick paper or bag marked with a Red Dot/X. Hand over separately to sanitary waste collector. Never dump in wet or dry bins.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Sanitary Hygiene Disposal Guidelines)',
    sourceUrl: 'https://swachhbharatmission.ddws.gov.in/diaper-handling-sop',
    sourceAuthority: 'Swachh Bharat Urban Taskforce',
    verified: false
  },
  {
    wasteCategory: 'SANITARY_PAD',
    wasteStream: 'SANITARY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Used feminine menstrual pads, liners, tampons. Wrap securely in paper pouch or newspaper provided with pad packaging. Never flush in toilets as plastic core clogs sewer lines. Discard in designated Red Bin / Sanitary Stream for municipal biomedical incineration.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Menstrual Hygiene Management Protocol India)',
    sourceUrl: 'https://swachhbharatmission.ddws.gov.in/mhm-guidelines',
    sourceAuthority: 'Ministry of Jal Shakti & MoHUA',
    verified: false
  },
  {
    wasteCategory: 'BATTERY',
    wasteStream: 'SPECIAL_CARE_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Alkaline batteries, lithium-ion phone/laptop cells, button cells, lead-acid invertor batteries. Highly hazardous: risk of heavy metal leakage and thermal fire. Tape battery terminals with electrical tape. Store dry and hand over exclusively to authorized Battery EPR take-back drop-off centers.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Battery Waste Management Rules 2022)',
    sourceUrl: 'https://cpcb.nic.in/battery-waste-management-rules',
    sourceAuthority: 'MoEFCC / Central Pollution Control Board',
    verified: false
  },
  {
    wasteCategory: 'SMALL_E_WASTE',
    wasteStream: 'SPECIAL_CARE_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Old mobile phones, calculators, digital watches, smoke alarms, broken circuit boards, electric toothbrushes. Contains recoverable precious metals and hazardous lead/cadmium solder. Drop at designated municipal E-Waste collection bins or authorized PRO collection kiosk.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (E-Waste Management Rules 2022)',
    sourceUrl: 'https://cpcb.nic.in/e-waste-epr-guidelines',
    sourceAuthority: 'Central Pollution Control Board (CPCB)',
    verified: false
  },
  {
    wasteCategory: 'ELECTRONIC_ACCESSORY',
    wasteStream: 'SPECIAL_CARE_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Charging cables, adapters, earphones, USB flash drives, power cords, phone covers with built-in magnets. Do not discard in general dry waste. Pack in small e-waste bag for electrical scrap recycling to strip PVC and extract copper wiring safely.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (CPCB Electrical Accessories EPR Note)',
    sourceUrl: 'https://cpcb.nic.in/cable-wire-recycling',
    sourceAuthority: 'CPCB Technical Wing',
    verified: false
  },
  {
    wasteCategory: 'MEDICINE',
    wasteStream: 'SPECIAL_CARE_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Expired pharmaceuticals, antibiotic capsules, liquid syrups, medicated ointments. Never flush down drains as it contaminates aquatic ecosystems and groundwater. Return to pharmacy buy-back drop-boxes or hand over to municipal Special Domestic Hazardous collection vehicles.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Bio-Medical Waste Management Rules Schedule I)',
    sourceUrl: 'https://cpcb.nic.in/pharmaceutical-discard-norms',
    sourceAuthority: 'Central Drugs Standard Control Organisation (CDSCO) / CPCB',
    verified: false
  },
  {
    wasteCategory: 'PAINT_CONTAINER',
    wasteStream: 'SPECIAL_CARE_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Empty or partially filled paint tins, solvent containers, varnish cans, enamel cans. Contains toxic VOCs and heavy chemical pigments. Allow remaining paint to dry completely with lid open in ventilated area, or hand over to authorized hazardous waste facility. Do not pour liquid paint in drains.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Hazardous and Other Wastes Rules 2016)',
    sourceUrl: 'https://cpcb.nic.in/hazardous-domestic-waste',
    sourceAuthority: 'State Pollution Control Boards / CPCB',
    verified: false
  },
  {
    wasteCategory: 'PESTICIDE_CONTAINER',
    wasteStream: 'SPECIAL_CARE_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Household insecticide cans, mosquito vaporizers, garden pesticide bottles. Highly hazardous chemical toxins. Puncture empty aerosol cans only after full discharge and handle as Hazardous Domestic Waste. Never reuse pesticide containers for water or food storage.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Insecticides Discard Protocol India)',
    sourceUrl: 'https://cpcb.nic.in/chemical-container-decontamination',
    sourceAuthority: 'Ministry of Agriculture & Farmers Welfare / CPCB',
    verified: false
  },
  {
    wasteCategory: 'MERCURY_ITEM',
    wasteStream: 'SPECIAL_CARE_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Traditional mercury glass clinical thermometers, fluorescent tube lights, CFL compact bulbs, sphygmomanometers. Neurotoxic elemental mercury. If broken, ventilate room immediately, collect beads using card/tape (never vacuum), and store in sealed glass jar with water. Hand to biomedical waste facility.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Minamata Convention on Mercury Guidance India)',
    sourceUrl: 'https://cpcb.nic.in/mercury-phase-out-guidelines',
    sourceAuthority: 'Ministry of Environment, Forest and Climate Change (MoEFCC)',
    verified: false
  },
  {
    wasteCategory: 'SHARP_MEDICAL_WASTE',
    wasteStream: 'SPECIAL_CARE_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Used insulin syringes, hypodermic needles, lancets, scalpel blades, IV sets. Severe blood-borne infection risk. Place in a puncture-proof rigid plastic container (e.g. thick bleach bottle with cap taped shut) or sharps disposal box. Label clearly "HAZARDOUS SHARPS" and hand over for autoclave/shredding.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Bio-Medical Waste Management Rules 2016)',
    sourceUrl: 'https://cpcb.nic.in/bio-medical-sharps-guideline',
    sourceAuthority: 'CPCB & Directorate General of Health Services',
    verified: false
  },
  {
    wasteCategory: 'MIXED_MATERIAL_PACKAGING',
    wasteStream: 'DRY_WASTE',
    jurisdiction: 'GENERAL_INDIA',
    guidanceText: 'Multilayered packaging such as Tetra Pak beverage cartons (cardboard + polyethylene + aluminum foil), blister packs, metallized snack packets (chips/namkeen). Rinse carton interior and flatten. Deposit in Blue Bin for specialized hydrapulping and cement-kiln energy recovery.',
    sourceTitle: 'Placeholder — pending verification against official Indian ULB source (Tetra Pak & Multi-Layered Plastic SOP)',
    sourceUrl: 'https://cpcb.nic.in/tetra-pak-recycling-framework',
    sourceAuthority: 'Central Pollution Control Board (CPCB)',
    verified: false
  }
];

async function seedKnowledgeBase() {
  try {
    await connectDB();

    console.log('[SeedKB] Clearing existing seed entries...');
    await KnowledgeEntry.deleteMany({ jurisdiction: 'GENERAL_INDIA' });

    console.log(`[SeedKB] Inserting ${SEED_DATA.length} comprehensive categories...`);
    const inserted = await KnowledgeEntry.insertMany(SEED_DATA);
    console.log(`[SeedKB] Successfully seeded ${inserted.length} KnowledgeEntry documents in MongoDB!`);

    // Attempt LanceDB sync if vector store service is initialized
    try {
      const { syncAllToVectorStore } = require('../services/vectorStoreService');
      console.log('[SeedKB] Rebuilding LanceDB vector store index from fresh MongoDB seed...');
      await syncAllToVectorStore();
      console.log('[SeedKB] LanceDB vector store synchronized successfully!');
    } catch (vErr) {
      console.log('[SeedKB] LanceDB sync will occur on first vector service startup:', vErr.message);
    }
  } catch (error) {
    logger.error('Error seeding knowledge base:', { error: error.message });
    console.error('SeedKB failed:', error.message);
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  seedKnowledgeBase();
}

module.exports = { seedKnowledgeBase, SEED_DATA };
