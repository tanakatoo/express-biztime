const express = require('express')
const db = require('../db')
const ExpressError = require('../expressError')
const router = new express.Router()

router.get('/', async (req, res, next) => {
    const results = await db.query(`SELECT * FROM companies`)
    return res.json({ companies: results.rows })
})

router.get('/:code', async (req, res, next) => {
    const { code } = req.params
    const results = await db.query(`SELECT * FROM companies WHERE code='${code}'`)
    return res.json({ company: results.rows[0] })
})

router.post('/', async (req, res, next) => {
    const { code, name, description } = req.body
    const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)  RETURNING *`, [code, name, description])

    return res.status(201).json({ company: results.rows[0] })
})

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const find = await db.query(`SELECT * FROM companies WHERE code='${code}'`)
        if (find.rows[0]) {
            const { name, description } = req.body
            const results = await db.query("UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *", [name, description, code])
            return res.status(201).json({ company: { code: code, name: name, description: description } })
        } else {
            return next()
        }
    } catch (e) {
        const err = new ExpressError(`Not sure what happened, ${e}`, 404)
        next(err)
    }

})

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const find = await db.query(`SELECT * FROM companies WHERE code='${code}'`)
        if (find.rows[0]) {
            const results = await db.query("DELETE FROM companies WHERE code=$1", [code])
            return res.status(201).json({ status: "deleted" })
        } else {
            return next()
        }
    } catch (e) {
        const err = new ExpressError(`Not sure what happened, ${e}`, 404)
        next(err)
    }
})

module.exports = router;