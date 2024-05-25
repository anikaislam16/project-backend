const { KanbanProject } = require("../../../modules/KanbanModule");
const { Member } = require("../../../modules/MemberModule");
const { sendJoingProjectEmail, sendRemovingProjectEmail } = require("./SendMail");
const { KanbanBoard } = require("../../../modules/BoardModule");
// Function to handle errors
const handleErrors = (res, error) => {
  console.error(error);
  res.status(500).json({ message: "Internal Server Error" });
};


// Get all Kanban projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await KanbanProject.find();
    res.json(projects);
  } catch (error) {
    handleErrors(res, error);
  }
};

// Get a specific Kanban project
const getProjectById = async (req, res) => {
  try {
    const project = await KanbanProject.findById(req.params.id).populate(
      "boards"
    );
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (error) {
    handleErrors(res, error);
  }
};


// Create a new Kanban project
const createProject = async (req, res) => {
  const email = req.body.email;

  const existingMember = await Member.findOne({ email });

  const project = new KanbanProject({
    projectName: req.body.projectName,
    members: [
      {
        member_id: existingMember._id,
        role: 'admin',
      },],
    weekdays: req.body.weekDays,
    creator: existingMember._id,
  });

  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (error) {
    handleErrors(res, error);
  }
};

// Update a Kanban project (using PATCH for partial updates)
const updateProject = async (req, res) => {
  try {
    const { fieldName, value } = req.body;

    // Construct the update object dynamically
    const updateObject = {
      [fieldName]: value,
      // Add more fields as needed
    };

    const updatedProject = await KanbanProject.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    );

    res.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    handleErrors(res, error);
  }
};


const deleteProject = async (req, res) => {
  try {
    await KanbanProject.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (error) {
    handleErrors(res, error);
  }
};
const deleteMemberfromProject = async (req, res) => {
  try {
    const projectId = req.params.id; // Assuming projectId is the same as memberId
    const memberId = req.params.memberId;
    console.log("project", projectId, memberId);
    // Find the KanbanProject by projectId
    const kanbanProject = await KanbanProject.findOne({ _id: projectId });

    if (!kanbanProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    foundMember = kanbanProject.members.find(member => member.member_id.toString() === memberId);
    const Memberdetails = await Member.findOne({ _id: memberId });
    // Remove the member from the members array based on memberId
    kanbanProject.members = kanbanProject.members.filter(member => member.member_id.toString() !== memberId);
    console.log(Memberdetails.email, Memberdetails.name, kanbanProject.projectName, foundMember.role);
    sendRemovingProjectEmail(Memberdetails.email, Memberdetails.name, kanbanProject.projectName, foundMember.role);
    // Save the updated KanbanProject
    await kanbanProject.save();
    // Update all boards to remove the specified member_id
    const updateResult = await KanbanBoard.updateMany(
      { 'cards.members.member_id': memberId },
      { $pull: { 'cards.$[].members': { member_id: memberId } } },
      { multi: true }
    );
    console.log('Update result:', updateResult);

    ///ekhane mail er function.
    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

const addMemberInProject = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { email, member_id, role, username } = req.body;

    // Find the KanbanProject by ID
    const kanbanProject = await KanbanProject.findById(id);
    console.log("kanban", kanbanProject);
    if (!kanbanProject) {
      return res.status(200).json({ message: 'KanbanProject not found' });
    }

    sendJoingProjectEmail(email, username, id, kanbanProject.projectName, role);
    // Add the new member to the members array
    kanbanProject.members.push({ member_id, role });

    // Save the updated KanbanProject
    await kanbanProject.save();

    res.status(200).json({ message: 'Member added successfully', kanbanProject });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
const getProjectByMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    // Assuming your KanbanProject schema is named KanbanProjectModel
    var projectdata = await KanbanProject.find({ 'members.member_id': memberId });

    if (!projectdata || projectdata.length === 0) {
      return res.status(404).json({ message: 'No projects found for the member' });
    }
    const projects = await Promise.all(projectdata.map(async (project) => { //ekhane Promise.all dewate , projectdata er all index er result projects e store na howa prjonto next line execute hbe na. eta na dile projects empty hoyei response through krto.
      const creator = await Member.findById(project.creator);
      const member = project.members.find(member => member.member_id.equals(memberId));
      console.log(member);
      const role = member ? member.role : null;
      return {
        _id: project._id,
        projectName: project.projectName,
        members: project.members.length,
        creationTime: project.creationTime,
        creatorId: project.creator,
        creatorName: creator ? creator.name : "Unknown",
        role: role,
        weekDays: project.weekdays,
        projectType: 'Kanban'
      };
    }));

    // If projects found, send them as response
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Error finding projects by member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const updateDeveloperControl = async (req, res) => {
  const { id, memberId } = req.params;
  try {
    const kanbanProject = await KanbanProject.findOne({ _id: id });

    if (!kanbanProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const member = kanbanProject.members.find(m => m.member_id.equals(memberId));
    if (member) {
      console.log(member);
      member.drag = (member.drag === 'enable') ? 'disable' : 'enable';
      await kanbanProject.save();  // Save the changes back to the database
      console.log('Member drag status toggled successfully');
      res.status(200).json({ member });
    } else {
      console.log('Member not found');
    }
  }
  catch (error) {
    console.error('Error toggling member drag status:', error);
  }
}
module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject, deleteMemberfromProject, addMemberInProject, getProjectByMember, updateDeveloperControl };