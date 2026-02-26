const Task = require('../models/Task');
const { encrypt } = require('../utils/encryption');

/**
 * Utility to encrypt task sensitive fields for response
 */
const encryptTaskResponse = (task) => {
    const taskObj = task.toObject ? task.toObject() : task;
    return {
        ...taskObj,
        encryptedData: encrypt(JSON.stringify({
            title: taskObj.title,
            description: taskObj.description
        })),
        title: undefined,
        description: undefined
    };
};

// @desc    Get all tasks for current user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude from filtering
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create filter object
        const filter = { user: req.user.id };

        // Add filters from reqQuery if they have values
        Object.keys(reqQuery).forEach(key => {
            if (reqQuery[key] !== null && reqQuery[key] !== undefined && reqQuery[key] !== '') {
                filter[key] = reqQuery[key];
            }
        });

        // Add user to query
        query = Task.find(filter);

        // Search logic
        if (req.query.search) {
            query = query.find({
                title: { $regex: req.query.search, $options: 'i' }
            });
        }

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Task.countDocuments(filter);

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const tasks = await query;

        // Encrypt sensitive fields in response
        const encryptedTasks = tasks.map(encryptTaskResponse);

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: tasks.length,
            total,
            pagination,
            data: encryptedTasks
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({
            success: true,
            data: encryptTaskResponse(task)
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;

        const task = await Task.create(req.body);

        res.status(201).json({
            success: true,
            data: encryptTaskResponse(task)
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
    try {
        let task = await Task.findOne({ _id: req.params.id, user: req.user.id });

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: encryptTaskResponse(task)
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        await task.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
