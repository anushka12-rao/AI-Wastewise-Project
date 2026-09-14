const mongoose = require('mongoose');

const QueryLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'type is required'],
      enum: ['analyze', 'query']
    },
    inputSummary: {
      type: String,
      trim: true,
      default: ''
    },
    outcome: {
      type: String,
      required: [true, 'outcome is required'],
      enum: ['CONFIDENT', 'UNCERTAIN', 'COVERAGE_INSUFFICIENT']
    },
    wasteCategory: {
      type: String,
      trim: true
    },
    jurisdiction: {
      type: String,
      trim: true,
      default: 'GENERAL_INDIA'
    },
    citedEntryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KnowledgeEntry'
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

const QueryLog = mongoose.model('QueryLog', QueryLogSchema);

module.exports = { QueryLog };
