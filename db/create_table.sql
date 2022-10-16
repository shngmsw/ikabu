CREATE TABLE IF NOT EXISTS friend_code (
    user_id varchar(20) primary key
    ,code varchar(300)
);

CREATE TABLE IF NOT EXISTS members (
    user_id varchar(20) primary key
    ,message_count integer
);

CREATE TABLE IF NOT EXISTS random_matching_reactions (
    message_id varchar(20)
    ,user_id varchar(20)
);

CREATE TABLE IF NOT EXISTS random_matching_message (
    message_id varchar(20) primary key
    ,author_id varchar(20)
);

CREATE TABLE IF NOT EXISTS recruit (
    message_id varchar(20)
    ,author_id varchar(20)
    ,member_id varchar(20)
    ,created_at timestamp
);

CREATE TABLE IF NOT EXISTS team_divider (
    message_id varchar(20)
    ,member_id varchar(20)
    ,member_name varchar(64)
    ,team integer
    ,joined_match_count integer
    ,win integer
    ,force_spectate boolean
    ,created_at timestamp
);