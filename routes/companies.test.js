process.env.NODE_ENV = "test"

const request = require('supertest')
const app = require("../app")
const db = require('../db')

let testComp
beforeEach(async function () {
    let results = await db.query("INSERT INTO companies (code, name, description) VALUES ('ibm','IBM','It is very blue with lines') RETURNING * ")
    testComp = results.rows[0]
})

afterEach(async function () {
    let results = await db.query("DELETE FROM companies")
    // await db.query("ROLLBACK")
})

afterAll(async function () {
    await db.end()
})

describe('GET /companies', () => {
    test('Get list of all companies', async () => {
        const res = await request(app).get('/companies')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            companies: [{
                code: 'ibm',
                name: "IBM",
                description: "It is very blue with lines"
            }]
        })
    })

    test('Get one company', async () => {
        const res = await request(app).get('/companies/ibm')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            company: {
                code: 'ibm',
                name: "IBM",
                description: "It is very blue with lines",

            },
            invoices: [],
            industries: []
        })
    })

    test('Get one company but code wrong', async () => {
        const res = await request(app).get('/companies/ibmm')
        expect(res.statusCode).toBe(404)
        expect(res.body).toEqual({
            "error": {
                "message": "Not Found",
                "status": 404
            },
            "message": "Not Found"
        })
    })
})

describe('/POST route', function () {
    test("post new company", async () => {
        const res = await request(app).post('/companies').send({ name: "Fake Company", description: "The fakest company yet" })
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({
            company: {
                code: 'Fake-Company',
                name: "Fake Company",
                description: "The fakest company yet"
            }
        })
    })
})

describe('/PUT route', function () {
    test("update existing company", async () => {
        const res = await request(app).put('/companies/ibm').send({ name: "Fake Ibm", description: "The fakest Ibm yet" })
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({
            company: {
                code: 'ibm',
                name: "Fake Ibm",
                description: "The fakest Ibm yet"
            }
        })
    })

    test('Put one company but code wrong', async () => {
        const res = await request(app).put('/companies/ibmm').send({ name: "Fake Ibm", description: "The fakest Ibm yet" })
        expect(res.statusCode).toBe(404)
        expect(res.body).toEqual({
            "error": {
                "message": "Not Found",
                "status": 404
            },
            "message": "Not Found"
        })
    })
})

describe('/DELETE route', function () {
    test("deleting existing company", async () => {
        const res = await request(app).delete('/companies/ibm')
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({
            status: "deleted"
        })
    })

    test('Delete one company but code wrong', async () => {
        const res = await request(app).put('/companies/ibmm')
        expect(res.statusCode).toBe(404)
        expect(res.body).toEqual({
            "error": {
                "message": "Not Found",
                "status": 404
            },
            "message": "Not Found"
        })
    })
})