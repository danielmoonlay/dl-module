"use strict";
var _getSert = require("../getsert");
var helper = require("../../helper");
var generateCode = require("../../../src/utils/code-generator");
var ObjectId = require("mongodb").ObjectId;
var machineType = require("../../../src/managers/master/machine-type-manager");

class MachineTypeDataUtil {
    getNewData() {
        var Model = require("dl-models").master.MachineType;
        var data = new Model();

        var code = generateCode();


        data.code = code;
        data.name = `Ordername [${code}]`;
        data.description = `decription [${code}]`;
        data.indicators = [{
            indicator: `Tekanan Press Mangle[${code}]`,
            dataType: "number",
            value: 10,
        },
            {
                indicator: `Tekanan Press Mangl[${code}]`,
                dataType: "string",
                value: "10",
            }];

        return Promise.resolve(data);
    }

    getNewTestData() {
        return helper
            .getManager(machineType)
            .then((manager) => {
                return this.getNewData().then((data) => {
                    return manager.create(data)
                        .then((id) => manager.getSingleById(id));
                });
            });
    }
}

module.exports = new MachineTypeDataUtil();