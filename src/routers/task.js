const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')

const upload = multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)/)) {
            return cb(new Error('File must be an image'))
        }
        cb(undefined, true)
    }
})

router.post('/tasks', auth, async(req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//GET /tasks?completed=true
//GET /tasks?limit=10&skip
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async(req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async(req, res) => {
    const allowedUpdates = ['description', 'completed']
    const updates = Object.keys(req.body)
    if (!updates.every(update => allowedUpdates.includes(update))) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }
        updates.forEach(update => task[update] = req.body[update])

        await task.save()



        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/tasks/:id/pic', auth, upload.single('pic'), async(req, res) => {
    const buffer = await sharp(req.file.buffer).png().toBuffer()

    const task = await Task.findById(req.params.id)

    if (!task) {
        return res.status(404).send()
    }

    task.picture = buffer
    await task.save()
    res.send(task)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/tasks/:id/pic', auth, async(req, res) => {
    try {
        const task = await Task.findById(req.params.id)

        if (!task.picture) {
            throw new Error('No picture')
        }

        res.set('Content-Type', 'image/png')
        res.send(task.picture)
    } catch (e) {
        console.log(e)
        res.status(404).send(e)
    }
})

router.delete('/tasks/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router