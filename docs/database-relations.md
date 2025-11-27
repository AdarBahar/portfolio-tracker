SELECT
  'mysql' AS dbms,
  t.TABLE_SCHEMA,
  t.TABLE_NAME,
  c.COLUMN_NAME,
  c.ORDINAL_POSITION,
  c.DATA_TYPE,
  c.CHARACTER_MAXIMUM_LENGTH,
  n.CONSTRAINT_TYPE,
  k.REFERENCED_TABLE_SCHEMA,
  k.REFERENCED_TABLE_NAME,
  k.REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.TABLES t
LEFT JOIN INFORMATION_SCHEMA.COLUMNS c
  ON t.TABLE_SCHEMA = c.TABLE_SCHEMA
 AND t.TABLE_NAME  = c.TABLE_NAME
LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
  ON c.TABLE_SCHEMA = k.TABLE_SCHEMA
 AND c.TABLE_NAME   = k.TABLE_NAME
 AND c.COLUMN_NAME  = k.COLUMN_NAME
LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS n
  ON k.CONSTRAINT_SCHEMA = n.CONSTRAINT_SCHEMA
 AND k.CONSTRAINT_NAME   = n.CONSTRAINT_NAME
 AND k.TABLE_SCHEMA      = n.TABLE_SCHEMA
 AND k.TABLE_NAME        = n.TABLE_NAME
WHERE
  t.TABLE_TYPE = 'BASE TABLE'
  AND t.TABLE_SCHEMA = 'baharc5_fantasyBroker';

Showing rows 0 - 193 (194 total, Query took 6.5073 seconds.)

dbms	TABLE_SCHEMA	TABLE_NAME	COLUMN_NAME	ORDINAL_POSITION	DATA_TYPE	CHARACTER_MAXIMUM_LENGTH	CONSTRAINT_TYPE	REFERENCED_TABLE_SCHEMA	REFERENCED_TABLE_NAME	REFERENCED_COLUMN_NAME	
mysql	baharc5_fantasyBroker	bull_pens	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	invite_code	13	varchar	16	UNIQUE	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	host_user_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	market_data	symbol	1	varchar	32	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bonus_redemptions	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bonus_redemptions	idempotency_key	6	varchar	255	UNIQUE	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bonus_redemptions	promotion_id	3	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	promotions	id	
mysql	baharc5_fantasyBroker	bonus_redemptions	user_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	user_budgets	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_budgets	user_id	2	int	NULL	UNIQUE	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_budgets	user_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	dividends	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	dividends	user_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	rake_collection	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_collection	bull_pen_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	bull_pens	id	
mysql	baharc5_fantasyBroker	rake_collection	rake_config_id	3	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	rake_config	id	
mysql	baharc5_fantasyBroker	leaderboard_snapshots	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	leaderboard_snapshots	bull_pen_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	bull_pens	id	
mysql	baharc5_fantasyBroker	leaderboard_snapshots	user_id	3	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	holdings	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	user_id	2	int	NULL	UNIQUE	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	ticker	3	varchar	10	UNIQUE	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	user_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	transactions	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	transactions	user_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	user_audit_log	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_audit_log	user_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	bull_pen_positions	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_positions	bull_pen_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	bull_pens	id	
mysql	baharc5_fantasyBroker	bull_pen_positions	user_id	3	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	bull_pens	name	3	varchar	255	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	description	4	text	65535	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	state	5	varchar	20	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	settlement_status	6	varchar	20	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	start_time	7	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	duration_sec	8	int	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	max_players	9	int	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	starting_cash	10	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	allow_fractional	11	tinyint	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	approval_required	12	tinyint	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	created_at	14	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	updated_at	15	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pens	deleted_at	16	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	market_data	current_price	2	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	market_data	company_name	3	varchar	255	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	market_data	change_percent	4	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	market_data	last_updated	5	timestamp	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bonus_redemptions	amount	4	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bonus_redemptions	currency	5	varchar	10	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bonus_redemptions	correlation_id	7	varchar	255	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bonus_redemptions	redeemed_at	8	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_budgets	available_balance	3	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_budgets	locked_balance	4	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_budgets	currency	5	varchar	10	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_budgets	status	6	varchar	20	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_budgets	created_at	7	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_budgets	updated_at	8	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_budgets	deleted_at	9	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	dividends	ticker	3	varchar	10	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	dividends	amount	4	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	dividends	shares	5	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	dividends	date	6	date	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	dividends	created_at	7	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	dividends	deleted_at	8	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_collection	pool_size	4	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_collection	rake_amount	5	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_collection	collected_at	6	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	leaderboard_snapshots	snapshot_at	4	timestamp	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	leaderboard_snapshots	rank	5	int	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	leaderboard_snapshots	portfolio_value	6	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	leaderboard_snapshots	pnl_abs	7	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	leaderboard_snapshots	pnl_pct	8	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	leaderboard_snapshots	last_trade_at	9	timestamp	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	leaderboard_snapshots	deleted_at	10	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	name	4	varchar	100	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	shares	5	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	purchase_price	6	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	purchase_date	7	date	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	sector	8	varchar	50	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	asset_class	9	varchar	50	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	status	10	varchar	20	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	created_at	11	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	updated_at	12	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	holdings	deleted_at	13	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	transactions	type	3	varchar	20	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	transactions	ticker	4	varchar	10	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	transactions	shares	5	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	transactions	price	6	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	transactions	fees	7	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	transactions	date	8	date	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	transactions	created_at	9	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	transactions	deleted_at	10	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_audit_log	event_type	3	varchar	100	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_audit_log	event_category	4	varchar	50	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_audit_log	description	5	text	65535	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_audit_log	ip_address	6	varchar	45	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_audit_log	user_agent	7	text	65535	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_audit_log	previous_values	8	longtext	4294967295	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_audit_log	new_values	9	longtext	4294967295	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	user_audit_log	created_at	10	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_positions	symbol	4	varchar	32	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_positions	qty	5	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_positions	avg_cost	6	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_positions	created_at	7	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_config	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_config	name	2	varchar	100	UNIQUE	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	code	2	varchar	50	UNIQUE	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_memberships	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_memberships	bull_pen_id	2	int	NULL	UNIQUE	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_memberships	user_id	3	int	NULL	UNIQUE	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_memberships	bull_pen_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	bull_pens	id	
mysql	baharc5_fantasyBroker	bull_pen_memberships	user_id	3	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	users	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	email	2	varchar	255	UNIQUE	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	google_id	6	varchar	255	UNIQUE	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	idempotency_key	15	varchar	64	UNIQUE	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	bull_pen_id	9	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	bull_pens	id	
mysql	baharc5_fantasyBroker	budget_logs	counterparty_user_id	11	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	budget_logs	user_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	bull_pen_orders	id	1	int	NULL	PRIMARY KEY	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	bull_pen_id	2	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	bull_pens	id	
mysql	baharc5_fantasyBroker	bull_pen_orders	user_id	3	int	NULL	FOREIGN KEY	baharc5_fantasyBroker	users	id	
mysql	baharc5_fantasyBroker	bull_pen_positions	updated_at	8	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_positions	deleted_at	9	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_config	description	3	text	65535	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_config	fee_type	4	varchar	20	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_config	fee_value	5	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_config	min_pool	6	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_config	max_pool	7	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_config	is_active	8	tinyint	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_config	created_at	9	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	rake_config	updated_at	10	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	name	3	varchar	100	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	description	4	text	65535	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	bonus_type	5	varchar	20	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	bonus_amount	6	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	currency	7	varchar	10	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	max_uses	8	int	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	current_uses	9	int	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	min_account_age_days	10	int	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	start_date	11	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	end_date	12	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	is_active	13	tinyint	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	created_at	14	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	promotions	updated_at	15	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_memberships	role	4	varchar	20	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_memberships	status	5	varchar	20	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_memberships	cash	6	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_memberships	joined_at	7	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_memberships	deleted_at	8	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	name	3	varchar	100	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	auth_provider	4	varchar	20	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	password_hash	5	varchar	255	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	profile_picture	7	varchar	500	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	google_access_token	8	text	65535	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	google_refresh_token	9	text	65535	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	google_token_expiry	10	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	is_demo	11	tinyint	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	last_login	12	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	created_at	13	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	updated_at	14	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	deleted_at	15	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	status	16	varchar	30	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	users	is_admin	17	tinyint	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	direction	3	varchar	10	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	operation_type	4	varchar	50	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	amount	5	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	currency	6	varchar	10	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	balance_before	7	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	balance_after	8	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	season_id	10	int	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	moved_from	12	varchar	20	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	moved_to	13	varchar	20	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	correlation_id	14	varchar	64	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	created_by	16	varchar	50	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	meta	17	longtext	4294967295	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	created_at	18	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	budget_logs	deleted_at	19	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	symbol	4	varchar	32	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	side	5	enum	4	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	type	6	enum	6	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	qty	7	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	filled_qty	8	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	limit_price	9	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	avg_fill_price	10	decimal	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	status	11	enum	16	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	rejection_reason	12	text	65535	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	placed_at	13	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	filled_at	14	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	server_ts	15	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	feed_ts	16	datetime	NULL	NULL	NULL	NULL	NULL	
mysql	baharc5_fantasyBroker	bull_pen_orders	deleted_at	17	datetime	NULL	NULL	NULL	NULL	NULL	
