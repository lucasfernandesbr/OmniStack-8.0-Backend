const User = require('../models/User');

module.exports = {
    async store(req, res) {
        console.log(req.io, req.connectedUsers);

        const { userId } = req.params;
        const { user } = req.headers;

        const loggedUser = await User.findById(user);
        const targetUser = await User.findById(userId);

        if (!targetUser){
            return res.status(400).json({ error: 'user não existe' });
        }

        if (targetUser.likes.includes(loggedUser._id)) {
            const loggedSocket = req.connectedUsers[user];
            const targetSocket = req.connectedUsers[userId];

            if (loggedSocket) {
                req.io.to(loggedSocket).emit('match', targetUser);
            }

            if (targetSocket) {
                req.io.to(targetSocket).emit('match', loggedUser);
            }
        }

        loggedUser.likes.push(targetUser._id);

        await loggedUser.save();
        
        return res.json(loggedUser);
    }
}
