const fs = require('fs')
const jwt = require('jsonwebtoken')
const sizeOf = require('object-sizeof')
const localPath = 'dataStore.json'


exports.saveDataInFile = async (req, res, next) => {
    let file_descriptor = 0
    try {
        let obj = req.body.data
        let path, data, fileData = ''
        if (req.body.path != undefined && req.body.path !='') {
            path = req.body.path.replace(/\//g, '\\')
        }
        else
            path = localPath

        file_descriptor = (req.body.path != undefined && req.body.path!='') ? exports.checkFile(req.body.path) : exports.checkFile(localPath)
        if (file_descriptor != 0) {   //file exists
            fileData = fs.readFileSync(path)
            let stats = fs.statSync(path)
            let fileSizeInBytes = stats.size
            console.log(fileSizeInBytes)
            if (fileSizeInBytes > Math.pow(10, 9)) {
                return res.send({ message: "File size reached maximum limit of 1GB. Cannot add data" })
            }

        }
        if (Object.keys(obj).length != 1) {
            return res.send({ message: "Data invalid" })
        }
        let objKey = Object.keys(obj)[0]
        if (objKey.length > 32) {
            return res.send({ message: "Key length exceed the limit of 32chars" })
        }
        if (sizeOf(obj[objKey]) > 16000) {
            return res.send({ message: "Value length exceed the limit of 16KB" })
        }
        obj[objKey].expiresIn = (obj[objKey].expiresIn) ? obj[objKey].expiresIn : 300
        obj[objKey].token = exports.createToken({ key: objKey, expiresIn: obj[objKey].expiresIn })
        if (fileData.toString() != '') {
            let jsonData = JSON.parse(fileData)
            if (jsonData && typeof jsonData == 'object') {
                let keys = Object.keys(obj)
                for (let key of keys) {
                    if (Object.keys(jsonData).includes(key)) {
                        let access = exports.verifytoken(jsonData[key].token)
                        if (access == "Token Expired") {
                            delete jsonData[key]
                            fs.writeFileSync(path, JSON.stringify(jsonData))
                        }
                        else {
                            return res.send({ message: "Key cannot duplicate" })
                        }
                    }
                    jsonData[key] = obj[key]
                }
                data = JSON.stringify(jsonData)
            }
        }
        else {
            data = JSON.stringify(obj)
        }
        fs.writeFileSync(path, data)
        file_descriptor = (file_descriptor) ? exports.checkFile(path) : file_descriptor
        return res.send({ result: "saved successfully" })
    }
    catch (err) {
        res.send({ message: "Error Occured"})
    }
    finally {
        if (file_descriptor != 0) {
            fs.close(file_descriptor, (err) => {
                if (err) {
                    console.error("Failed to close file", err)
                    res.send({ message: "Error Occured" })
                }
            })
        }
    }

}



exports.readDataFromFile = (req, res, next) => {
    let file_descriptor = 0
    try {

        let key = req.query.id
        if (req.query.path != undefined && req.query.path != '') {
            path = req.query.path.replace(/\//g, '\\')
        }
        else
            path = localPath
        file_descriptor = exports.checkFile(path)
        if (file_descriptor == 0) {
            return res.send({ message: `File does not exist at path: ${path}` })
        }
        let obj = fs.readFileSync(path);
        let data
        let jsonData = JSON.parse(obj)
        if (jsonData && Object.keys(jsonData).includes(key)) {
            let access = exports.verifytoken(jsonData[key].token)
            if (access == "Token Expired") {
                return res.send({ message: "Data not found" })
            }
            else if (access.key == key) {
                delete jsonData[key].token
                delete jsonData[key].expiresIn
                data = jsonData[key]
            }
            else {
                throw "Token Error"
            }
        }
        else {
            return res.send({ message: "Data not found" })
        }
        res.send({ data: data })
    }
    catch (err) {
        console.log(err)
        res.send({ message: "error occured" })
    }
    finally {
        if (file_descriptor != 0) {
            fs.close(file_descriptor, (err) => {
                if (err) {
                    console.error("Failed to close file", err)
                    res.send({ message: "Error Occured" })
                }
            })
        }
    }
}

exports.deleteDataFromFile = (req, res, next) => {
    let file_descriptor = 0
    try {
        if (req.query.path != undefined && req.query.path!='')  {
            path = req.query.path.replace(/\//g, '\\')
        }
        else
            path = localPath
        file_descriptor = exports.checkFile(path)
        if (file_descriptor == 0) {
            return res.send({ message: `File does not exist at path: ${path}` })
        }
        file_descriptor = fs.openSync(path)
        let obj = fs.readFileSync(path);
        let key = req.query.id
        let data, jsonData
        if (obj) {
            jsonData = JSON.parse(obj)
            if (jsonData && Object.keys(jsonData).includes(key)) {
                let access = exports.verifytoken(jsonData[key].token)
                console.log(access)
                if (access == "Token Expired") {
                    return res.send({ message: "Data not found" })
                }
                else if (access.key == key) {
                    delete jsonData[key]
                }
                else {
                    throw "Token error"
                }
            }
            else
                return res.send({ message: "Data not found" })
        }
        fs.writeFileSync(path, JSON.stringify(jsonData))
        res.send({ result: "Key removed successfully" })
    }
    catch (err) {
        console.log(err)
        res.send({ message: "error occured" })
    }
    finally {
        if (file_descriptor != 0) {
            fs.close(file_descriptor, (err) => {
                if (err) {
                    console.error("Failed to close file", err)
                    res.send({ message: "Error Occured" })
                }
            })
        }
    }

}


exports.createToken = (data) => {
    const token = jwt.sign(
        {
            key: data.key
        },
        'SECURE101',
        {
            algorithm: 'HS256',
            expiresIn: `${data.expiresIn}s`,//s=seconds, m=minutes, h=hours
        }
    )
    return token;
}

exports.verifytoken = (token) => {

    let decoded = {};
    try {
        decoded = jwt.verify(token, 'SECURE101');
        return decoded;
    } catch (err) {
        return "Token Expired"
    }
}


exports.checkFile = (filepath) => {

    try {
        if (fs.existsSync(filepath)) {
            file_descriptor = fs.openSync(filepath)
            return file_descriptor
            //file exists
        }
        else {
            return 0   //default
        }
    } catch (err) {
        console.error(err)
    }
}
