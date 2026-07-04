const db = require("../modules/db");

exports.getEvents = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM events ORDER BY start_time ASC"
        );
        res.status(200).json({
            success: true,
            result: result.rows
        });
    } catch (error) {
        console.error(error)   
    }
}



exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT *
      FROM events
      WHERE event_no = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      result: result.rows[0],
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}


exports.createEvent = async (req, res) => {
  const {
    title,
    description,
    category,
    type,
    start_time,
    end_time,
    banner_url,
    modules
  } = req.body;

  const result = await db.query(
    `INSERT INTO events 
    (title, description, category, type, start_time, end_time, banner_url, modules)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      title,
      description,
      category,
      type,
      start_time,
      end_time,
      banner_url,
      JSON.stringify(modules)
    ]
  );

  res.json(result.rows[0]);
};


exports.joinEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  await db.query(
    `INSERT INTO event_attendance (event_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [eventId, userId]
  );

  // increase attendees count
  await db.query(
    `UPDATE events 
     SET attendees_count = attendees_count + 1
     WHERE event_no = $1`,
    [eventId]
  );

  res.json({ message: "Joined event successfully" });
};

exports.checkIfUserEnteredEvent = async(req,res)=>{

try{

const userId = req.user.id;


const result = await db.query(
`
SELECT *
FROM event_attendance
WHERE user_id=$1
`,
[userId]
);



res.json({

success:true,

exists:result.rows

});


}catch(error){

console.error(error);

res.status(500).json({

success:false,

exists:[]

});

}

}



exports.EventRequirement = async (req, res) => {

// ================= EVENTS REQUIREMENTS ROUTE =================
  try {
    const { id } = req.params;

    // ================= FETCH EVENT =================

    const result = await db.query(
      `
      SELECT
        id,
        title,
        description,
        category,
        type,
        banner_url,
        start_time,
        end_time,
        difficulty,
        requirements,
        judging_criteria,
        deliverables,
        technologies,
        rewards
      FROM events
      WHERE event_no = $1
      `,
      [id]
    );

    // ================= EVENT NOT FOUND =================

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const event = result.rows[0];

    // ================= SUCCESS =================

    res.status(200).json({
      success: true,
      result: {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        type: event.type,
        banner_url: event.banner_url,
        start_time: event.start_time,
        end_time: event.end_time,
        difficulty: event.difficulty,

        requirements: event.requirements || [],
        judging_criteria: event.judging_criteria || [],
        deliverables: event.deliverables || [],
        technologies: event.technologies || [],
        rewards: event.rewards || [],
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }


}


