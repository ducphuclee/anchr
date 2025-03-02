const axios = require('axios'),
    config = require('../../../config/config'),
    mongoose = require('mongoose'),
    User = mongoose.model('User')

function doRequest(method, payload) {
    const token = config.telegram.botToken
    const url = `https://api.telegram.org/bot${token}/${method}`
    return axios.post(url, payload)
        .then((response) => {
            if (!response.data.ok) throw response.data.description
            return response
        })
}

function downloadFile(fileId) {
    return doRequest('getFile', { file_id: fileId })
        .then((response) => {
            const file = response.data.result
            const token = config.telegram.botToken
            const url = `https://api.telegram.org/file/bot${token}/${file.file_path}`
            return axios.get(url, { responseType: 'stream' })
                .then((res) => {
                    return res.data
                })
                .then((stream) => {
                    return { file: file, stream: stream }
                })
        })
}

function resolveUser(telegramUser) {
    return new Promise((resolve, reject) => {
        User.findOne({ 'telegramUserId': telegramUser.id.toString() }, (err, user) => {
            if (err) return reject(err)
            if (!user) return reject('User not found.')
            resolve(user)
        })
    })

}

module.exports = {
    doRequest: doRequest,
    resolveUser: resolveUser,
    downloadFile: downloadFile
}