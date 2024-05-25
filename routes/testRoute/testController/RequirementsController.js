const Requirement = require('../../../modules/RequirementModule');

// Function to create a new requirement
async function createScrumRequirement(requirementData) {
  try {
    const { requirement, scrumProject, CardId } = requirementData;

    const newRequirement = new Requirement({
      requirement,
      scrumProject,
      
      CardId
    });

    const savedRequirement = await newRequirement.save();
    return savedRequirement;
  } catch (error) {
    throw error;
  }
}
// Function to create a new requirement
async function createKanbanRequirement(requirementData) {
  try {
    const { requirement,  kanbanBoard, CardId } = requirementData;

    const newRequirement = new Requirement({
      requirement,
      kanbanProject,
      
      CardId
    });

    const savedRequirement = await newRequirement.save();
    return savedRequirement;
  } catch (error) {
    throw error;
  }
}

module.exports={createKanbanRequirement,createScrumRequirement}