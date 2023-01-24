process.env.NODE_ENV = "test"

const request = require('supertest')
const app = require("../app")
const db = require('../db')

let testInv

beforeEach(async function () {
    let result1 = await db.query("INSERT INTO companies (code, name, description) VALUES ('fakeinv','fake IBM Invoice','It is very blue with lines') RETURNING * ")
    let result2 = await db.query("INSERT INTO invoices (comp_code, amt) VALUES ('fakeinv',25.99) RETURNING * ")
    testInv = result2.rows[0]

});

afterEach(async function () {
    let results = await db.query("DELETE FROM invoices")
    // await db.query("ROLLBACK")
    let results2 = await db.query("DELETE FROM companies")
    // await db.query("ROLLBACK")
});

afterAll(async function () {

    await db.end()

});


describe('GET /invoices', () => {
    test('Get list of all invoices', async () => {
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            invoices: [{
                "add_date": expect.any(String),
                "amt": 25.99,
                "comp_code": "fakeinv",
                "id": testInv.id,
                "paid": false,
                "paid_date": null,
            }]
        })
    })

    test('Get one invoice', async () => {
        const res = await request(app).get(`/invoices/${testInv.id}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({

            "invoice": {
                "add_date": expect.any(String),
                "amt": 25.99,
                "company": {
                    "code": "fakeinv",
                    "description": "It is very blue with lines",
                    "name": "fake IBM Invoice",
                },
                "id": testInv.id,
                "paid": false,
                "paid_date": null
            }
        })
    })

    test('Get one invoice but id wrong', async () => {
        const res = await request(app).get('/invoices/0')
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
    test("post new invoice", async () => {
        const res = await request(app).post('/invoices').send({ comp_code: "fakeinv", amt: 3.99 })
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            invoice: {
                "add_date": expect.any(String), //any string because it is expecting a string and not a date
                "amt": 3.99,
                "comp_code": "fakeinv",
                "id": expect.any(Number),
                "paid": false,
                "paid_date": null,
            }
        })
    })
})

describe('/PUT route', function () {
    test("update existing invoice", async () => {
        const res = await request(app).put(`/invoices/${testInv.id}`).send({ amt: 999.99 })
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            invoice: {
                "add_date": expect.any(String), //any string because it is expecting a string and not a date
                "amt": 999.99,
                "comp_code": "fakeinv",
                "id": expect.any(Number),
                "paid": false,
                "paid_date": null,
            }
        })
    })

    test('Put one invoice but id wrong', async () => {
        const res = await request(app).put('/companies/0').send({ amt: 999.99 })
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
    test("deleting existig invoice", async () => {
        const res = await request(app).delete(`/invoices/${testInv.id}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            status: "deleted"
        })
    })

    test('Delete one invoice but id wrong', async () => {
        const res = await request(app).put('/invoices/0')
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