/**
 * History routes for report management
 * Endpoints for fetching user's report history
 */
const express = require("express");

function createHistoryRouter({
    getReportsForUser,
    getReportById,
    logLine
}) {
    const router = express.Router();

    /**
     * GET /api/reports
     * Returns list of user's past reports (requires auth)
     */
    router.get("/reports", async (req, res) => {
        const reqId = req.reqId || "unknown";

        if (!req.authUser) {
            return res.status(401).json({
                ok: false,
                errorCode: "AUTH_REQUIRED",
                message: "Please log in to view your report history."
            });
        }

        try {
            const limit = Math.min(parseInt(req.query.limit) || 20, 50);
            const reports = await getReportsForUser(req.authUser.id, limit);

            logLine({
                level: "info",
                msg: "reports_list_fetched",
                reqId,
                userId: req.authUser.id,
                count: reports.length
            });

            return res.json({
                ok: true,
                reports
            });
        } catch (err) {
            logLine({
                level: "error",
                msg: "reports_list_failed",
                reqId,
                error: err.message
            }, true);

            return res.status(500).json({
                ok: false,
                errorCode: "FETCH_REPORTS_FAILED",
                message: "Could not load your report history. Please try again."
            });
        }
    });

    /**
     * GET /api/reports/:id
     * Returns a single report by ID (requires auth + ownership)
     */
    router.get("/reports/:id", async (req, res) => {
        const reqId = req.reqId || "unknown";
        const reportId = req.params.id;

        if (!req.authUser) {
            return res.status(401).json({
                ok: false,
                errorCode: "AUTH_REQUIRED",
                message: "Please log in to view this report."
            });
        }

        if (!reportId || typeof reportId !== "string" || reportId.length < 10) {
            return res.status(400).json({
                ok: false,
                errorCode: "INVALID_REPORT_ID",
                message: "Invalid report ID."
            });
        }

        try {
            const report = await getReportById(reportId, req.authUser.id);

            if (!report) {
                return res.status(404).json({
                    ok: false,
                    errorCode: "REPORT_NOT_FOUND",
                    message: "Report not found or you don't have access to it."
                });
            }

            logLine({
                level: "info",
                msg: "report_fetched",
                reqId,
                userId: req.authUser.id,
                reportId
            });

            return res.json({
                ok: true,
                report
            });
        } catch (err) {
            logLine({
                level: "error",
                msg: "report_fetch_failed",
                reqId,
                reportId,
                error: err.message
            }, true);

            return res.status(500).json({
                ok: false,
                errorCode: "FETCH_REPORT_FAILED",
                message: "Could not load this report. Please try again."
            });
        }
    });

    return router;
}

module.exports = { createHistoryRouter };
