const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    picture: {
        type: Buffer
    }
}, {
    timestamps: true
})
taskSchema.methods.toJSON = function() {
    const task = this
    const taskObject = task.toObject()

    delete taskObject.picture

    return taskObject
}

const Task = mongoose.model('Task', taskSchema)

module.exports = Task