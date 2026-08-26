"""
Mentor Me — Interactive Matching Demo
Run locally with:  streamlit run app.py

This app is a thin UI layer over the actual matching algorithm
(matching_algorithm_v1.py) — it does not reimplement any matching logic,
it calls the same functions used and tested throughout the capstone.
"""

import streamlit as st
import pandas as pd
from matching_algorithm_v1 import (
    get_match_recommendation, get_mentee_pool, get_mentor_pool, match_quality_label
)

st.set_page_config(page_title="Mentor Me — Matching Demo", layout="wide")

st.title("🤝 Mentor Me — Live Matching Demo")
st.caption(
    "Demonstrates the weighted matching algorithm from the capstone's Matching "
    "Algorithm & Methodology section, running on real (synthetic-labeled) profiles."
)

@st.cache_data
def load_data():
    df = pd.read_csv('so2020_cleaned.csv')
    mentees = get_mentee_pool(df)
    mentors = get_mentor_pool(df)
    return df, mentees, mentors

df, mentees, mentors = load_data()

st.sidebar.header("Demo Controls")
st.sidebar.markdown(
    "**Note:** profiles below are drawn from the Stack Overflow 2020 survey, "
    "used as synthetic stand-ins for real mentee/mentor sign-ups (see "
    "Methodology section, Section 3, for why)."
)

mode = st.sidebar.radio("Choose a mentee", ["Pick a real sample profile", "Build a custom profile"])

if mode == "Pick a real sample profile":
    sample_ids = mentees['Respondent'].head(30).tolist()
    chosen_id = st.sidebar.selectbox("Sample mentee (Respondent ID)", sample_ids)
    mentee = mentees[mentees['Respondent'] == chosen_id].iloc[0]
else:
    st.sidebar.markdown("**Build a custom mentee profile:**")
    mentee_name = st.sidebar.text_input("Name (for demo purposes only — not used in matching)", value="New Mentee")
    countries = sorted(df['Country'].dropna().unique().tolist())
    mentee_country = st.sidebar.selectbox("Country", countries, index=countries.index("United States") if "United States" in countries else 0)
    ed_levels = sorted(df['EdLevel'].dropna().unique().tolist())
    mentee_ed = st.sidebar.selectbox("Education level", ed_levels)
    all_roles = sorted(set(
        r for roles in df['DevType'].dropna() if roles != 'Not stated'
        for r in roles.split(';')
    ))
    picked_roles = st.sidebar.multiselect("Role(s)", all_roles, default=[all_roles[0]])
    years = st.sidebar.slider("Years of professional experience", 0, 15, 1)
    exp_tier = '0-2y' if years <= 2 else '2-5y' if years <= 5 else '5-10y' if years <= 10 else '10-20y'
    all_factors = sorted(set(
        f for factors in df['JobFactors'].dropna() if factors != 'Not stated'
        for f in factors.split(';')
    ))
    picked_factors = st.sidebar.multiselect("Job priorities", all_factors, default=[all_factors[0]])
    mentee = pd.Series({
        'Respondent': -1,
        'Name': mentee_name,
        'Country': mentee_country,
        'EdLevel': mentee_ed,
        'DevType': ';'.join(picked_roles) if picked_roles else 'Not stated',
        'YearsCodePro': float(years),
        'exp_tier': exp_tier,
        'JobFactors': ';'.join(picked_factors) if picked_factors else None,
        'OrgSize': 'Not stated',
    })

pool_size = st.sidebar.slider(
    "Simulated mentor pool size",
    min_value=10, max_value=mentors.shape[0], value=100,
    help="Smaller values simulate an early-stage platform with few mentors signed up yet."
)
mentor_pool = mentors.sample(n=pool_size, random_state=1) if pool_size < mentors.shape[0] else mentors

same_country_filter = st.sidebar.checkbox(
    "Prefer same-country mentors only (optional filter, not part of the score)",
    value=False,
    help="This is a hard filter applied BEFORE matching, not a weighted criterion — "
         "country was deliberately left out of the scoring model since it isn't "
         "supported by the Objective 1 analysis and would shrink the mentor pool "
         "for every mentee, which evaluation showed already hurts match quality."
)

if same_country_filter:
    mentee_country_value = mentee.get('Country')
    filtered_pool = mentor_pool[mentor_pool['Country'] == mentee_country_value]
    if filtered_pool.empty:
        st.warning(
            f"No mentors from {mentee_country_value} in the current pool "
            f"({mentor_pool.shape[0]} candidates) — showing all countries instead. "
            f"This is exactly the coverage risk evaluation flagged: geographic "
            f"filtering shrinks an already-limited early-stage pool."
        )
    else:
        mentor_pool = filtered_pool
        st.sidebar.caption(f"Filtered to {mentor_pool.shape[0]} mentors from {mentee_country_value}")

col1, col2 = st.columns([1, 2])

with col1:
    st.subheader("Mentee Profile")
    st.write(f"**Name:** {mentee['Name'] if 'Name' in mentee and pd.notna(mentee.get('Name')) else 'Sample Respondent ' + str(mentee['Respondent'])}")
    st.write(f"**Country:** {mentee['Country'] if pd.notna(mentee.get('Country')) else 'Not stated'}")
    st.write(f"**Education:** {mentee['EdLevel'] if pd.notna(mentee.get('EdLevel')) else 'Not stated'}")
    st.write(f"**Role(s):** {mentee['DevType']}")
    st.write(f"**Experience:** {mentee['YearsCodePro']} years ({mentee['exp_tier']})")
    st.write(f"**Priorities:** {mentee['JobFactors'] if pd.notna(mentee['JobFactors']) else 'Not specified'}")
    st.write(f"**Mentor pool size:** {mentor_pool.shape[0]} candidates")
    st.caption("Name, Country, and Education are shown for context but are not currently part of the matching score.")

with col2:
    st.subheader("Matching Results")
    result = get_match_recommendation(mentee, mentor_pool, top_n=5)
    st.info(result['message'])

    if not result['matches'].empty:
        display_df = result['matches'][
            ['mentor_id', 'mentor_devtype', 'mentor_years', 'total_score', 'quality']
        ].rename(columns={
            'mentor_id': 'Mentor ID',
            'mentor_devtype': 'Mentor Role(s)',
            'mentor_years': 'Mentor Experience (yrs)',
            'total_score': 'Match Score',
            'quality': 'Confidence'
        })

        def highlight_quality(val):
            colors = {'Strong': '#c6e6c6', 'Good': '#f5e6a8', 'Fair': '#f5c99b', 'Weak': '#f0b3b3'}
            return f'background-color: {colors.get(val, "white")}'

        st.dataframe(
            display_df.style.applymap(highlight_quality, subset=['Confidence']),
            use_container_width=True
        )

        st.subheader("Score Breakdown — Top Match")
        top = result['matches'].iloc[0]
        breakdown = pd.DataFrame({
            'Criterion': ['Role alignment (30%)', 'Experience gap (25%)', 'Career-stage priority (20%)',
                          'Goals alignment (15%)', 'Practical fit (10%)'],
            'Score': [top['role_score'], top['experience_score'], top['career_stage_score'],
                      top['goals_score'], top['practical_score']]
        })
        st.bar_chart(breakdown.set_index('Criterion'))

st.divider()
st.caption(
    "Algorithm: rule-based weighted scoring (5 criteria) — see the "
    "Matching Algorithm & Methodology document for full research, evaluation, "
    "and limitations. Evaluated at 80.6% improvement over random baseline "
    "matching (n=100 sampled mentees)."
)
