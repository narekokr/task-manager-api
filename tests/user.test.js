const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')


beforeEach(setupDatabase)

test('Should signup a new user', async() => {
    const response = await request(app).post('/users').send({
        name: 'Narek',
        email: 'narek.okroyan@gmail.com',
        password: 'mongoose'
    }).expect(201)

    //Asser that the database was changed
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()


})

test('Should not signup user with invalid name/email/password', async() => {
    const response = await request(app).post('/users').send({
        name: 'Narek',
        email: 'gmail.com',
        password: 'mongoose'
    }).expect(400)
})

test('Should login existing user', async() => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexisting user', async() => {
    await request(app).post('/users/login').send({
        email: 'yeah',
        password: userOne.password
    }).expect(400)
})

test('Should get profile for user', async() => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async() => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async() => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauth user', async() => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)

})

test('upload avatar', async() => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ name: 'yeah' })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('yeah')
})

test('should not update invalid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ location: 'yeah' })
        .expect(400)
})

test('Should not update user if unauthenticated', async() => {
    await request(app)
        .patch('/users/me').
    send({ name: 'yeah' })
        .expect(401)
})

test('Should not update user with invalid name/email/password', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ password: 'yeah' })
        .expect(400)
})

test('Should not delete user if unauthenticated', async() => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})