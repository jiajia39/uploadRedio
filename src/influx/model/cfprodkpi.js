import mongoose, { Schema } from 'mongoose';

const CfProdKPISchema = new Schema({
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
  cKPIType: {
    type: String,
  },
  cKPIFactorGuid: {
    type: String,
    required: true,
  },
  cKPIFactor: {
    type: String,
    required: true,
  },
  cKPIFactorDesc: {
    type: String,
    required: false,
    default: '',
  },
  cKPIFactorUnit: {
    type: String,
    default: '',
  },
  iKPI: {
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

CfProdKPISchema.virtual('cGuid').get(function() {
  return this._id.toHexString();
});

CfProdKPISchema.set('toJSON', {
  virtuals: true,
});

export const CfProdKPIColl = mongoose.model('CfProdKPI', CfProdKPISchema);
