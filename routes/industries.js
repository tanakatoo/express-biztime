const express = require('express')
const db = require('../db')
const ExpressError = require('../expressError')
const router = new express.Router()

router.get('/', async (req, res, next) => {
    const results = await db.query(`select i.industry, 
    (select json_agg(c.code) from companies c join industries_companies ic on ic.comp_code=c.code where ic.ind_code=i.ind_code) as company_code
    from industries i`)
    {
        industries: [
            {
                industry: 'ele',
                company_codes: ['ibm',
                    'apple']
            },
            {
                industry: 'motor',
                company_codes: ['apple']
            },]
    }

    return res.json({ industries: results.rows })
})

router.post('/', async (req, res, next) => {
    const { indCode, name } = req.body
    // make code
    const results = await db.query(`INSERT INTO industries (ind_code, industry) VALUES ($1, $2)  RETURNING *`, [indCode, name])

    return res.status(201).json({ industry: results.rows[0] })
})

router.post('/:indCode/add', async (req, res, next) => {
    const { indCode } = req.params
    const { comp_code } = req.body
    // make code
    const results = await db.query(`INSERT INTO industries_companies (ind_code, comp_code) VALUES ($1, $2)  RETURNING *`, [indCode, comp_code])

    return res.status(201).json({ industry_company: results.rows[0] })
})

module.exports = router