const express = require('express')
const router = new express.Router()
const db = require('../db')
const ExpressError = require('../expressError')

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`)

        return res.json({ invoices: results.rows })

    } catch (e) {
        const err = new ExpressError(`Not sure what happened, ${e}`, 404)
        next(err)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const find = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id])
        if (find.rows[0]) {
            const results = await db.query(`SELECT * FROM invoices i JOIN companies c ON i.comp_code=c.code WHERE i.id=$1`, [id])


            return res.json({
                invoice: {
                    id: results.rows[0].id,
                    amt: results.rows[0].amt,
                    paid: results.rows[0].paid,
                    add_date: results.rows[0].add_date,
                    paid_date: results.rows[0].paid_date,
                    company: {
                        code: results.rows[0].code,
                        name: results.rows[0].name,
                        description: results.rows[0].description
                    }
                }
            })


        } else {
            return next()
        }
    } catch (e) {
        const err = new ExpressError(`Not sure what happened, ${e}`, 404)
        next(err)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES($1,$2) RETURNING *`, [comp_code, amt])

        if (results.rows) {
            return res.json({
                invoice: {
                    id: results.rows[0].id,
                    comp_code: results.rows[0].comp_code,
                    amt: results.rows[0].amt,
                    paid: results.rows[0].paid,
                    add_date: results.rows[0].add_date,
                    paid_date: results.rows[0].paid_date
                }
            })
        } else {
            return next()
        }
    } catch (e) {
        const err = new ExpressError(`Not sure what happened, ${e}`, 404)
        next(err)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const { amt, paid } = req.body
        const find = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id])
        if (find.rows[0]) {
            // check to see if it is paid, if not, set paid_date to today
            if (!find.rows[0].paid && paid) {
                let date = Date(Date.now()).toString()
                console.log(date)
                const results = await db.query(`UPDATE invoices SET amt=($1), paid=$2, paid_date=CURRENT_DATE WHERE id=$3 RETURNING *`, [amt, true, id])
                return res.json({
                    invoice: {
                        id: results.rows[0].id,
                        comp_code: results.rows[0].comp_code,
                        amt: results.rows[0].amt,
                        paid: results.rows[0].paid,
                        add_date: results.rows[0].add_date,
                        paid_date: results.rows[0].paid_date
                    }
                })
            } else if (!paid && !find.rows[0].paid_date != null) {
                // set paid date to null
                const results = await db.query(`UPDATE invoices SET amt=($1), paid=$2, paid_date=$3 WHERE id=$4 RETURNING *`, [amt, false, null, id])
                return res.json({
                    invoice: {
                        id: results.rows[0].id,
                        comp_code: results.rows[0].comp_code,
                        amt: results.rows[0].amt,
                        paid: results.rows[0].paid,
                        add_date: results.rows[0].add_date,
                        paid_date: results.rows[0].paid_date
                    }
                })

            } else {
                // leave paid date
                const results = await db.query(`UPDATE invoices SET amt=($1) WHERE id=$2 RETURNING *`, [amt, id])
                return res.json({
                    invoice: {
                        id: results.rows[0].id,
                        comp_code: results.rows[0].comp_code,
                        amt: results.rows[0].amt,
                        paid: results.rows[0].paid,
                        add_date: results.rows[0].add_date,
                        paid_date: results.rows[0].paid_date
                    }
                })
            }

        } else {
            return next()
        }
    } catch (e) {
        const err = new ExpressError(`Not sure what happened, ${e}`, 404)
        next(err)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const find = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id])
        console.log(find.rows)
        if (find.rows[0]) {
            const results = await db.query(`DELETE FROM invoices WHERE id=$1`, [id])

            return res.json({
                status: "deleted"
            })
        } else {
            return next()
        }
    } catch (e) {
        const err = new ExpressError(`Not sure what happened, ${e}`, 404)
        next(err)
    }
})

module.exports = router