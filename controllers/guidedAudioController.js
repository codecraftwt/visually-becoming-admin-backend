const firebase = require("../services/firebaseService");
const multer = require("multer");
const COLLECTION = "admin_guidedAudio";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

exports.getGuidedAudio = async (req, res, next) => {
  try {
    console.log(`[getGuidedAudio] Fetching all guided audio from collection: ${COLLECTION}`);
    const data = await firebase.getAll(COLLECTION);
    console.log(`[getGuidedAudio] Successfully fetched ${data.length} items`);
    res.json(data);
  } catch (err) {
    console.error(`[getGuidedAudio] Error fetching guided audio:`, {
      message: err.message,
      stack: err.stack,
      collection: COLLECTION
    });
    next(err);
  }
};

exports.getGuidedAudioByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const data = await firebase.getAll(COLLECTION);
    const filteredData = data.filter(item => item.categoryId === categoryId);
    res.json(filteredData);
  } catch (err) {
    next(err);
  }
};

exports.createGuidedAudio = async (req, res, next) => {
  try {
    let audioData = { ...req.body };

    // Convert string booleans to actual booleans
    if (audioData.isPublished === "true") audioData.isPublished = true;
    if (audioData.isPublished === "false") audioData.isPublished = false;
    if (audioData.isPremium === "true") audioData.isPremium = true;
    if (audioData.isPremium === "false") audioData.isPremium = false;

    // MODE 1: Direct client uploads - audio array provided with pre-uploaded URLs
    if (req.body.audio && Array.isArray(req.body.audio)) {
      // Files are already uploaded to Firebase Storage by the client
      // Just use the audio array as-is
      audioData.audio = req.body.audio;
    }
    // MODE 2: Backend uploads - files sent via FormData (legacy support)
    else if (req.files && req.files.length > 0) {
      // Handle multiple audio files if provided
      const audioFiles = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const audioUrl = await firebase.uploadAudioFile(file, file.originalname);
        const gender = req.body.genders ? req.body.genders[i] : 'male'; // Default to male if not specified
        audioFiles.push({
          audioUrl,
          gender
        });
      }
      audioData.audio = audioFiles;
    } else if (req.file) {
      // Single file upload for backward compatibility
      const audioUrl = await firebase.uploadAudioFile(req.file, req.file.originalname);
      audioData.audio = [{
        audioUrl,
        gender: req.body.gender || 'male'
      }];
    }

    const newItem = await firebase.create(COLLECTION, audioData);
    res.json(newItem);
  } catch (err) {
    next(err);
  }
};

exports.updateGuidedAudio = async (req, res, next) => {
  try {
    let updateData = { ...req.body };

    // Convert string booleans to actual booleans
    if (updateData.isPublished === "true") updateData.isPublished = true;
    if (updateData.isPublished === "false") updateData.isPublished = false;
    if (updateData.isPremium === "true") updateData.isPremium = true;
    if (updateData.isPremium === "false") updateData.isPremium = false;

    // MODE 1: Direct client uploads - audio array provided with pre-uploaded URLs
    if (req.body.audio && Array.isArray(req.body.audio)) {
      // Files are already uploaded to Firebase Storage by the client
      // Handle deleted audio indices if provided
      if (req.body.deletedAudioIndices && Array.isArray(req.body.deletedAudioIndices)) {
        // Get current content to find URLs of deleted audio
        const audioItems = await firebase.getAll(COLLECTION);
        const currentItem = audioItems.find(item => item.id === req.params.id);
        
        if (currentItem && currentItem.audio) {
          // Delete files from storage for deleted audio
          for (const index of req.body.deletedAudioIndices) {
            if (currentItem.audio[index] && currentItem.audio[index].audioUrl) {
              await firebase.deleteAudioFile(currentItem.audio[index].audioUrl);
            }
          }
        }
      }
      
      // Use the provided audio array directly
      updateData.audio = req.body.audio;
    }
    // MODE 2: Backend uploads - files sent via FormData (legacy support)
    // This is handled by updateGuidedAudioWithFile

    const updated = await firebase.update(COLLECTION, req.params.id, updateData);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.updateGuidedAudioWithFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Convert string booleans to actual booleans
    if (updateData.isPublished === "true") updateData.isPublished = true;
    if (updateData.isPublished === "false") updateData.isPublished = false;
    if (updateData.isPremium === "true") updateData.isPremium = true;
    if (updateData.isPremium === "false") updateData.isPremium = false;

    // MODE 1: Direct client uploads - audio array provided with pre-uploaded URLs (JSON mode)
    if (req.body.audio && Array.isArray(req.body.audio)) {
      // Files are already uploaded to Firebase Storage by the client
      // Handle deleted audio indices if provided
      if (req.body.deletedAudioIndices && Array.isArray(req.body.deletedAudioIndices)) {
        // Get current content to find URLs of deleted audio
        const audioItems = await firebase.getAll(COLLECTION);
        const currentItem = audioItems.find(item => item.id === id);
        
        if (currentItem && currentItem.audio) {
          // Delete files from storage for deleted audio
          for (const index of req.body.deletedAudioIndices) {
            if (currentItem.audio[index] && currentItem.audio[index].audioUrl) {
              await firebase.deleteAudioFile(currentItem.audio[index].audioUrl);
            }
          }
        }
      }
      
      // Use the provided audio array directly
      updateData.audio = req.body.audio;
    }
    // MODE 2: Backend uploads - files sent via FormData (legacy support)
    else {
      // Parse existing audio data from the request
      let existingAudio = [];
      if (req.body.existingAudio) {
        // Handle both single object and array of objects
        const existingAudioData = Array.isArray(req.body.existingAudio)
          ? req.body.existingAudio
          : [req.body.existingAudio];

        existingAudio = existingAudioData.map(item => {
          try {
            return typeof item === 'string' ? JSON.parse(item) : item;
          } catch (e) {
            return item;
          }
        });
      }

      // Handle new audio files if provided
      let newAudioFiles = [];
      if (req.files && req.files.length > 0) {
        const existingAudioCount = existingAudio.length;
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const audioUrl = await firebase.uploadAudioFile(file, file.originalname);
          const genderIndex = existingAudioCount + i;
          const gender = req.body.genders ? req.body.genders[genderIndex] : 'male';
          newAudioFiles.push({
            audioUrl,
            gender
          });
        }
      }

      // Combine existing audio (with updated properties) and new uploaded files
      updateData.audio = [...existingAudio, ...newAudioFiles];
    }

    const updated = await firebase.update(COLLECTION, id, updateData);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteGuidedAudio = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the audio item first to delete associated files
    const audioItems = await firebase.getAll(COLLECTION);
    const audioItem = audioItems.find(item => item.id === id);

    if (audioItem && audioItem.audio && Array.isArray(audioItem.audio)) {
      // Delete all associated audio files from Firebase Storage
      for (const audio of audioItem.audio) {
        if (audio.audioUrl) {
          await firebase.deleteAudioFile(audio.audioUrl);
        }
      }
    }

    // Delete the document from Firestore
    await firebase.deleteItem(COLLECTION, id);
    res.json({ message: "Audio item deleted successfully", id });
  } catch (err) {
    next(err);
  }
};

// Export the multer middleware for use in routes
exports.uploadAudio = upload.single('audioFile');
