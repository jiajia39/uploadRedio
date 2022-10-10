import mongoose, { Schema } from 'mongoose';

const CfProdSummarySchema = new Schema({
  dDate: { type: Date, default: null },
  cOrgGuid: {
    type: String,
  },
  cOrgCode: {
    type: String,
    required: true,
  },
  cOrgName: {
    type: String,
    required: true,
  },
  cOrgType: {
    type: String,
  },
  cParentGuid: {
    type: String,
  },
  cParentOrgCode: {
    type: String,
  },
  cParentOrgName: {
    type: String,
  },
  cAssetGuid: {
    type: String,
  },
  cAssetCode: {
    type: String,
    required: true,
  },
  cAssetName: {
    type: String,
    required: true,
  },
  cProduct: {
    type: String,
    default: '',
  },
  iProd: {
    type: Number,
    default: 0,
  },
  iLoad: {
    type: Number,
    default: 0,
  },
  cMemo: {
    type: String,
    default: '',
  },
  cCreateUserGuid: {
    type: String,
    default: '',
  },
  cCreateUserId: {
    type: String,
    default: '',
  },
  cCreateUserName: {
    type: String,
    default: '',
  },
  dCreateTime: { type: Date, default: Date.now },
  cModifyUserGuid: {
    type: String,
    default: '',
  },
  cModifyUserId: {
    type: String,
    default: '',
  },
  cModifyUserName: {
    type: String,
    default: '',
  },
  dModifyTime: { type: Date, default: null },
});

CfProdSummarySchema.virtual('cGuid').get(function() {
  return this._id.toHexString();
});

CfProdSummarySchema.set('toJSON', {
  virtuals: true,
});

export const CfProdSummaryColl = mongoose.model('CfProdSummary', CfProdSummarySchema);
