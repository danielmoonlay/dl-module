var helper = require("../helper");
var ObjectId = require("mongodb").ObjectId;
var validatorPurchasing = require('dl-models').validator.purchasing;
var UnitPaymentPriceCorrectionNoteManager = require("../../src/managers/purchasing/unit-payment-price-correction-note-manager");
var UnitPaymentOrderManager = require("../../src/managers/purchasing/unit-payment-order-manager");
var unitPaymentPriceCorrectionNoteManager = null;
var unitPaymentOrderManager = null;
var UnitPaymentOrder = require('dl-models').purchasing.UnitPaymentOrder;
var UnitPaymentPriceCorrectionNote = require('dl-models').purchasing.UnitPaymentPriceCorrectionNote;
var UnitPaymentPriceCorrectionNoteItem = require('dl-models').purchasing.UnitPaymentPriceCorrectionNoteItem;

require("should");

function getDataUnitPaymentPriceCorrection(unitPaymentOrder) {
    var unitPaymentPriceCorrectionNote = new UnitPaymentPriceCorrectionNote();
    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    unitPaymentPriceCorrectionNote.no = code;
    unitPaymentPriceCorrectionNote.date = new Date();
    unitPaymentPriceCorrectionNote.unitPaymentOrderId = unitPaymentOrder._id;
    unitPaymentPriceCorrectionNote.unitPaymentOrder = unitPaymentOrder;
    unitPaymentPriceCorrectionNote.invoiceCorrectionNo = `invoiceCorrectionNo ${code}`;
    unitPaymentPriceCorrectionNote.invoiceCorrectionDate = new Date();
    unitPaymentPriceCorrectionNote.incomeTaxCorrectionNo = `incomeTaxCorrectionNo ${code}`;
    unitPaymentPriceCorrectionNote.incomeTaxCorrectionDate = new Date();
    unitPaymentPriceCorrectionNote.vatTaxCorrectionNo = `vatTaxCorrectionNo ${code}`;
    unitPaymentPriceCorrectionNote.vatTaxCorrectionDate = new Date();
    unitPaymentPriceCorrectionNote.unitCoverLetterNo = `unitCoverLetterNo ${code}`;
    unitPaymentPriceCorrectionNote.remark = `remark ${code}`;

    var _item = []
    for (var unitPaymentOrderItem of unitPaymentOrder.items) {
        var unitPaymentPriceCorrectionNoteItem = new UnitPaymentPriceCorrectionNoteItem();

        for (var unitReceiptNoteItem of unitPaymentOrderItem.unitReceiptNote.items) {
            unitPaymentPriceCorrectionNoteItem.purchaseOrderExternalId = unitReceiptNoteItem.purchaseOrder.purchaseOrderExternalId;
            unitPaymentPriceCorrectionNoteItem.purchaseOrderExternal = unitReceiptNoteItem.purchaseOrder.purchaseOrderExternal;
            unitPaymentPriceCorrectionNoteItem.purchaseRequestId = unitReceiptNoteItem.purchaseOrder.purchaseRequestId;
            unitPaymentPriceCorrectionNoteItem.purchaseRequest = unitReceiptNoteItem.purchaseOrder.purchaseRequest;
            unitPaymentPriceCorrectionNoteItem.product = unitReceiptNoteItem.product;
            unitPaymentPriceCorrectionNoteItem.productId = unitReceiptNoteItem.product._id;
            unitPaymentPriceCorrectionNoteItem.quantity = unitReceiptNoteItem.deliveredQuantity;
            unitPaymentPriceCorrectionNoteItem.uom = unitReceiptNoteItem.deliveredUom;
            unitPaymentPriceCorrectionNoteItem.uomId = unitReceiptNoteItem.deliveredUomId;
            unitPaymentPriceCorrectionNoteItem.pricePerUnit = unitReceiptNoteItem.pricePerDealUnit;
            unitPaymentPriceCorrectionNoteItem.priceTotal = unitReceiptNoteItem.pricePerDealUnit * unitReceiptNoteItem.deliveredQuantity;
            unitPaymentPriceCorrectionNoteItem.currency = unitReceiptNoteItem.currency;
            unitPaymentPriceCorrectionNoteItem.currencyRate = unitReceiptNoteItem.currencyRate;

            _item.push(unitPaymentPriceCorrectionNoteItem);
        }
    }
    unitPaymentPriceCorrectionNote.items = _item;
    return unitPaymentPriceCorrectionNote;

}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            unitPaymentPriceCorrectionNoteManager = new UnitPaymentPriceCorrectionNoteManager(db, {
                username: 'unit-test'
            });

            unitPaymentOrderManager = new UnitPaymentOrderManager(db, {
                username: 'unit-test'
            });

            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#01. should success when read data', function (done) {
    unitPaymentPriceCorrectionNoteManager.read()
        .then(documents => {
            //process documents
            documents.data.should.be.instanceof(Array);
            done();
        })
        .catch(e => {
            done(e);
        })
});
var unitPaymentOrder = new UnitPaymentOrder();
it(`#02. should success when get data Unit Payment Order`, function (done) {
    unitPaymentOrderManager.getSingleById("5809e23d7a58e236c4e174e0")
        .then(data => { 
            data.should.instanceof(Object);
            unitPaymentOrder = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdId;
it('#03. should success when create new data', function (done) {
    var data = getDataUnitPaymentPriceCorrection(unitPaymentOrder);

    unitPaymentPriceCorrectionNoteManager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdData;
it(`#04. should success when get created data with id`, function (done) {
    unitPaymentPriceCorrectionNoteManager.getSingleById( createdId )
        .then(data => {
            data.should.instanceof(Object);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#05. should success when update created data`, function (done) {
    createdData.remark += '[updated]';

    unitPaymentPriceCorrectionNoteManager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#06. should success when get updated data with id`, function (done) {
    unitPaymentPriceCorrectionNoteManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            data.no.should.equal(createdData.no);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#07. should error when create new data with same code', function (done) {
    var data = Object.assign({}, createdData);
    delete data._id;
    unitPaymentPriceCorrectionNoteManager.create(data)
        .then(id => {
            id.should.be.Object();
            done();
        })
        .catch(e => {
            e.errors.should.have.property('no');
            done();
        })
});

it('#08. should error when create new blank data', function (done) {
    unitPaymentPriceCorrectionNoteManager.create({})
        .then(id => {
            id.should.be.Object();
            done();
        })
        .catch(e => {
            e.errors.should.have.property('no');
            e.errors.should.have.property('unitPaymentOrder');
            e.errors.should.have.property('invoiceCorrectionNo');
            e.errors.should.have.property('invoiceCorrectionDate');
            done();
        })
});

it(`#09. should success when delete data`, function (done) {
    unitPaymentPriceCorrectionNoteManager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});
