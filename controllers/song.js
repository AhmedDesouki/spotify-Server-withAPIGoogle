const { User } = require("../models/user");
const { Song, validate } = require("../models/song");

const createSong = async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send({ message: error.details[0].message });
  const song = await Song(req.body);
  if (req.file) {
    song.audio = req.file.path;
  }
  song.artist = req.user._id;
  const user = await User.findById(req.user._id);
  song.save();
  user.artistSongs.push(song._id);
  user.save();
  res.status(201).send({ data: song, message: "Song created successfully" });
};

const getSongs = async (req, res) => {
  const songs = await Song.find();
  res.status(200).send({ data: songs });
};

const updateSong = async (req, res) => {
  const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.send({ data: song, message: "Updated song successfully" });
};

const deleteSong = async (req, res) => {
  const song = await Song.findByIdAndDelete(req.params.id);
  const user = await User.findById(req.user._id);
  user.artistSongs.splice(user.artistSongs.indexOf(song._id), 1);
  user.save();
  res.status(200).send({ message: "Song deleted sucessfully" });
};

const likeSong = async (req, res) => {
  let resMessage = "";
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(400).send({ message: "song does not exist" });

  const user = await User.findById(req.user._id);
  const index = user.likedSongs.indexOf(song._id);
  if (index === -1) {
    user.likedSongs.push(song._id);
    resMessage = "Added to your liked songs";
  } else {
    user.likedSongs.splice(index, 1);
    resMessage = "Removed from your liked songs";
  }

  await user.save();
  res.status(200).send({ message: resMessage });
};

const getLikedSongs = async (req, res) => {
  const user = await User.findById(req.user._id);
  const songs = await Song.find({ _id: user.likedSongs });
  res.status(200).send({ data: songs });
};

const getSong = async (req, res) => {
  const dir = __dirname.replace("controllers", "");
  console.log(dir);
  let song;
  if (req.params.id) song = await Song.findById(req.params.id);
  else {
    song = await Song.find();
    song = song[parseInt(Math.random() * song.length)];
  }
  if (!song) return res.status(400).json({ message: "invalid song id" });
  const user = await User.findById(req.user._id);
  user.recentSongs.push(song._id);
  user.save();
  res.sendFile(song.audio, { root: dir });
};

const getRecentPlays = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).send(user.recentSongs);
};

module.exports = {
  createSong,
  getSongs,
  updateSong,
  deleteSong,
  likeSong,
  getLikedSongs,
  getSong,
  getRecentPlays,
};
