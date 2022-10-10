import mongoose, { Schema } from 'mongoose';

const CfProdKPIFactorSchema = new Schema({
  cKPIType: {
    type: String,
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

CfProdKPIFactorSchema.virtual('cGuid').get(function() {
  return this._id.toHexString();
});

CfProdKPIFactorSchema.set('toJSON', {
  virtuals: true,
});

export const CfProdKPIFactorColl = mongoose.model('CfProdKPIFactor', CfProdKPIFactorSchema);
