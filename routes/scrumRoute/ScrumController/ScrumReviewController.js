 // Assuming DailyScrum model is exported from './DailyScrum'
const DailyScrum=require('../../../modules/ScrumReviewModule')
async function getDailyScrumsByParam(paramType, paramValue) {
  try {
    let query = {};
    if (paramType === "projectId") {
      query = { projectId: paramValue };
    } else if (paramType === "name") {
      query = { name: paramValue };
    } else if (paramType === "_id") {
      query = { _id: paramValue };
    } else {
      throw new Error("Invalid paramType");
    }

    const scrums = await DailyScrum.find(query);
    console.log(scrums);
    return scrums;
  } catch (error) {
    console.error(`Error fetching daily scrums by ${paramType}:`, error);
    throw error;
  }
}

async function getDailyScrumsByName(name) {
  //console.log(projectId);
  try {
    const scrums = await DailyScrum.find({ name: name });

    console.log(scrums);
    return scrums;
  } catch (error) {
    console.error("Error fetching daily scrums by projectId:", error);
    throw error;
  }
}
async function createDailyScrum({ name, type, scrumDate, content, projectId }) {
  try {
    // Create a new DailyScrum object
    //console.log(name, type, scrumDate, content, projectId);
    const newDailyScrum = new DailyScrum({
      name: name,
      type: type,
      scrumDate: scrumDate,
      content: content,
      projectId: projectId,
    });

    // Save the DailyScrum object to the database
    const savedDailyScrum = await newDailyScrum.save();

    return savedDailyScrum;
  } catch (error) {
    console.error("Error creating daily scrum:", error);
    throw error;
  }
}
async function updateDailyScrum(id, content) {
  console.log(id);
  try {
    // Find the DailyScrum document by ID and update only the content field
    const updatedScrum = await DailyScrum.findByIdAndUpdate(
      id,
      { content: content },
      {
        new: true,
        runValidators: true,
      }
    );

    return updatedScrum;
  } catch (error) {
    console.error("Error updating daily scrum:", error);
    throw error;
  }
}


module.exports = {
  getDailyScrumsByParam,
  getDailyScrumsByName,
  createDailyScrum,
  updateDailyScrum,
};
