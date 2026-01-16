# data to store

{
  "daily_challenge": {
    "streak": {
      "current": <int>,
      "last-played": <date>
    }
    "score_log": [
      {
        "date":  <date>,
        "skill_score": <float>,
        "sccore": <float>,
        "guesses": [
          <float> - score per country (0, 0.5, 1) for computing global performance
        ]
      }
    ]
  },
  "countries": {
    <country_id> : {
      3x3 array of modality x modality. columns for prompted modality, rows for input modality
      each entry in the array is an object:
        {
          "learning": {
            "last_correct": <date>,
            "learing_rate": <float> - number of days till next prompted for learning
          },
          "testing": [
            <float> - skill scores for last 5 tests
          ]
        }
    }
  }
}