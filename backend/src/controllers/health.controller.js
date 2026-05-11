function getHealth(req, res) {
  res.status(200).json({
    success: true,
    message: "BJeans.co backend is running"
  });
}

module.exports = {
  getHealth
};
