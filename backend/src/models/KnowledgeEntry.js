const mongoose = require('mongoose');

const PRIMARY_WASTE_STREAMS = [
  'WET_WASTE',
  'DRY_WASTE',
  'SANITARY_WASTE',
  'SPECIAL_CARE_WASTE'
];

const WASTE_CATEGORIES = [
  'WET_WASTE',
  'PAPER',
  'CARDBOARD',
  'PLASTIC_CONTAINER',
  'PLASTIC_PACKAGING',
  'GLASS',
  'METAL',
  'TEXTILE',
  'FOOD_CONTAMINATED_PACKAGING',
  'SANITARY_WASTE',
  'DIAPER',
  'SANITARY_PAD',
  'BATTERY',
  'SMALL_E_WASTE',
  'ELECTRONIC_ACCESSORY',
  'MEDICINE',
  'PAINT_CONTAINER',
  'PESTICIDE_CONTAINER',
  'MERCURY_ITEM',
  'SHARP_MEDICAL_WASTE',
  'MIXED_MATERIAL_PACKAGING',
  'UNKNOWN'
];

const KnowledgeEntrySchema = new mongoose.Schema(
  {
    wasteCategory: {
      type: String,
      required: [true, 'wasteCategory is required'],
      enum: {
        values: WASTE_CATEGORIES,
        message: '{VALUE} is not a valid WasteCategory'
      },
      index: true
    },
    wasteStream: {
      type: String,
      required: [true, 'wasteStream is required'],
      enum: {
        values: PRIMARY_WASTE_STREAMS,
        message: '{VALUE} is not a valid PrimaryWasteStream'
      },
      index: true
    },
    jurisdiction: {
      type: String,
      required: [true, 'jurisdiction is required'],
      default: 'GENERAL_INDIA',
      trim: true,
      index: true
    },
    guidanceText: {
      type: String,
      required: [true, 'guidanceText is required'],
      trim: true
    },
    sourceTitle: {
      type: String,
      required: [true, 'sourceTitle is required'],
      trim: true
    },
    sourceUrl: {
      type: String,
      required: [true, 'sourceUrl is required'],
      trim: true
    },
    sourceAuthority: {
      type: String,
      trim: true,
      default: 'Indian Municipal / CPCB Authority'
    },
    verified: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const KnowledgeEntry = mongoose.model('KnowledgeEntry', KnowledgeEntrySchema);

module.exports = {
  KnowledgeEntry,
  PRIMARY_WASTE_STREAMS,
  WASTE_CATEGORIES
};
