-- ==============================================================================
-- DEPARTMENT EXPENSE TRACKER - COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Garment Manufacturing Department: Monthly Budget & DPR/PR Expense Management
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. FACTORIES TABLE
CREATE TABLE IF NOT EXISTS public.factories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_code VARCHAR(20) NOT NULL UNIQUE,
    factory_name VARCHAR(100) NOT NULL,
    badge_color VARCHAR(30) NOT NULL DEFAULT 'blue',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(30) NOT NULL DEFAULT 'slate',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. MONTHLY BUDGET LINES TABLE
CREATE TABLE IF NOT EXISTS public.budget_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
    factory_id UUID NOT NULL REFERENCES public.factories(id) ON DELETE RESTRICT,
    budget_line VARCHAR(200) NOT NULL,
    amount_lkr NUMERIC(14, 2) NOT NULL CHECK (amount_lkr > 0),
    exchange_rate_used NUMERIC(10, 4) NOT NULL CHECK (exchange_rate_used > 0),
    amount_usd NUMERIC(14, 2) NOT NULL CHECK (amount_usd > 0),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_date DATE NOT NULL,
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
    factory_id UUID NOT NULL REFERENCES public.factories(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    dpr_pr_type VARCHAR(10) NOT NULL CHECK (dpr_pr_type IN ('DPR', 'PR')),
    dpr_pr_number VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount_lkr NUMERIC(14, 2) NOT NULL CHECK (amount_lkr > 0),
    exchange_rate_used NUMERIC(10, 4) NOT NULL CHECK (exchange_rate_used > 0),
    amount_usd NUMERIC(14, 2) NOT NULL CHECK (amount_usd > 0),
    workflow_number VARCHAR(100),
    grn_number VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_budget_lines_month_year ON public.budget_lines(year, month);
CREATE INDEX IF NOT EXISTS idx_budget_lines_factory_id ON public.budget_lines(factory_id);

CREATE INDEX IF NOT EXISTS idx_expenses_month_year ON public.expenses(year, month);
CREATE INDEX IF NOT EXISTS idx_expenses_factory_id ON public.expenses(factory_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_dpr_pr_no ON public.expenses(dpr_pr_number);

-- 8. TRIGGER FOR AUTO-UPDATING updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_budget_lines_updated_at ON public.budget_lines;
CREATE TRIGGER set_budget_lines_updated_at
    BEFORE UPDATE ON public.budget_lines
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_expenses_updated_at ON public.expenses;
CREATE TRIGGER set_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_settings_updated_at ON public.settings;
CREATE TRIGGER set_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full CRUD operations on all tables
-- (Office staff and department admins authenticated via Supabase Auth)
CREATE POLICY "Authenticated users can select factories"
    ON public.factories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert factories"
    ON public.factories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update factories"
    ON public.factories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete factories"
    ON public.factories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can select categories"
    ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert categories"
    ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories"
    ON public.categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete categories"
    ON public.categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can select settings"
    ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert settings"
    ON public.settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update settings"
    ON public.settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete settings"
    ON public.settings FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can select budget_lines"
    ON public.budget_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert budget_lines"
    ON public.budget_lines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update budget_lines"
    ON public.budget_lines FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete budget_lines"
    ON public.budget_lines FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can select expenses"
    ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert expenses"
    ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update expenses"
    ON public.expenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete expenses"
    ON public.expenses FOR DELETE TO authenticated USING (true);


-- 10. SEED DATA - FACTORIES
INSERT INTO public.factories (factory_code, factory_name, badge_color, is_active)
VALUES
    ('FTY 01', 'Factory 01 - Katunayake Plant', 'blue', true),
    ('FTY 03', 'Factory 03 - Biyagama Plant', 'indigo', true),
    ('FTY 04', 'Factory 04 - Avissawella Plant', 'teal', true),
    ('FTY 05', 'Factory 05 - Koggala Plant', 'purple', true)
ON CONFLICT (factory_code) DO NOTHING;

-- 11. SEED DATA - CATEGORIES
INSERT INTO public.categories (category_name, color, is_active)
VALUES
    ('Machine Spares', 'emerald', true),
    ('Needle', 'sky', true),
    ('Folder', 'amber', true),
    ('Jig Boards', 'purple', true),
    ('Hardware', 'rose', true)
ON CONFLICT (category_name) DO NOTHING;

-- 12. SEED DATA - SYSTEM SETTINGS
INSERT INTO public.settings (setting_key, setting_value, description)
VALUES
    ('exchange_rate', '303.30', 'Current baseline exchange rate (1 USD = X LKR). Historical transactions retain their stored rate.')
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description;


-- 13. SEED DATA - OCTOBER 2026 BUDGET LINES (Sample Data for Verification)
DO $$
DECLARE
    f01 UUID;
    f03 UUID;
    f04 UUID;
    f05 UUID;
    rate NUMERIC := 303.30;
BEGIN
    SELECT id INTO f01 FROM public.factories WHERE factory_code = 'FTY 01' LIMIT 1;
    SELECT id INTO f03 FROM public.factories WHERE factory_code = 'FTY 03' LIMIT 1;
    SELECT id INTO f04 FROM public.factories WHERE factory_code = 'FTY 04' LIMIT 1;
    SELECT id INTO f05 FROM public.factories WHERE factory_code = 'FTY 05' LIMIT 1;

    -- Clear existing Oct 2026 sample entries if any
    DELETE FROM public.expenses WHERE month = 10 AND year = 2026;
    DELETE FROM public.budget_lines WHERE month = 10 AND year = 2026;

    -- FTY 01 Budget: 250,000 LKR
    INSERT INTO public.budget_lines (month, year, factory_id, budget_line, amount_lkr, exchange_rate_used, amount_usd, note)
    VALUES (10, 2026, f01, 'October Monthly Allocation', 250000.00, rate, ROUND(250000.00 / rate, 2), 'Standard monthly allocation');

    -- FTY 03 Budget: 350,000 LKR
    INSERT INTO public.budget_lines (month, year, factory_id, budget_line, amount_lkr, exchange_rate_used, amount_usd, note)
    VALUES (10, 2026, f03, 'October Monthly Allocation', 350000.00, rate, ROUND(350000.00 / rate, 2), 'Standard monthly allocation');

    -- FTY 04 Budget: 450,000 LKR
    INSERT INTO public.budget_lines (month, year, factory_id, budget_line, amount_lkr, exchange_rate_used, amount_usd, note)
    VALUES (10, 2026, f04, 'October Monthly Allocation', 450000.00, rate, ROUND(450000.00 / rate, 2), 'Standard monthly allocation');

    -- FTY 05 Budget: 500,000 LKR + 100,000 LKR Top-up (Total: 600,000 LKR)
    INSERT INTO public.budget_lines (month, year, factory_id, budget_line, amount_lkr, exchange_rate_used, amount_usd, note)
    VALUES (10, 2026, f05, 'October Monthly Budget', 500000.00, rate, ROUND(500000.00 / rate, 2), 'Monthly allocation');

    INSERT INTO public.budget_lines (month, year, factory_id, budget_line, amount_lkr, exchange_rate_used, amount_usd, note)
    VALUES (10, 2026, f05, 'Additional Top-up', 100000.00, rate, ROUND(100000.00 / rate, 2), 'Peak season top-up approved');
END $$;


-- 14. SEED DATA - OCTOBER 2026 REALISTIC EXPENSES (Sample Data for Verification)
DO $$
DECLARE
    f01 UUID;
    f03 UUID;
    f04 UUID;
    f05 UUID;
    c_spares UUID;
    c_needle UUID;
    c_folder UUID;
    c_jig UUID;
    c_hardware UUID;
    rate NUMERIC := 303.30;
BEGIN
    SELECT id INTO f01 FROM public.factories WHERE factory_code = 'FTY 01' LIMIT 1;
    SELECT id INTO f03 FROM public.factories WHERE factory_code = 'FTY 03' LIMIT 1;
    SELECT id INTO f04 FROM public.factories WHERE factory_code = 'FTY 04' LIMIT 1;
    SELECT id INTO f05 FROM public.factories WHERE factory_code = 'FTY 05' LIMIT 1;

    SELECT id INTO c_spares FROM public.categories WHERE category_name = 'Machine Spares' LIMIT 1;
    SELECT id INTO c_needle FROM public.categories WHERE category_name = 'Needle' LIMIT 1;
    SELECT id INTO c_folder FROM public.categories WHERE category_name = 'Folder' LIMIT 1;
    SELECT id INTO c_jig FROM public.categories WHERE category_name = 'Jig Boards' LIMIT 1;
    SELECT id INTO c_hardware FROM public.categories WHERE category_name = 'Hardware' LIMIT 1;

    -- Transaction 1: FTY 05 | Folder | DPR | FR-0367
    INSERT INTO public.expenses (expense_date, month, year, factory_id, category_id, dpr_pr_type, dpr_pr_number, description, amount_lkr, exchange_rate_used, amount_usd, workflow_number, grn_number, remarks)
    VALUES ('2026-10-02', 10, 2026, f05, c_folder, 'DPR', 'DPR-2026-081', 'FR-0367 Folder Attachment', 4800.00, rate, ROUND(4800.00 / rate, 2), 'WF-9912', 'GRN-5541', 'For line 4 shirt placket');

    -- Transaction 2: FTY 04 | Machine Spares | DPR | Jack MC Parts (13,648 -> USD 45.00)
    INSERT INTO public.expenses (expense_date, month, year, factory_id, category_id, dpr_pr_type, dpr_pr_number, description, amount_lkr, exchange_rate_used, amount_usd, workflow_number, grn_number, remarks)
    VALUES ('2026-10-04', 10, 2026, f04, c_spares, 'DPR', 'DPR-2026-082', 'Jack MC Parts', 13648.00, rate, ROUND(13648.00 / rate, 2), 'WF-9915', 'GRN-5545', 'Motor replacement drive');

    -- Transaction 3: FTY 03 | Needle | PR | Needle Groz-Beckert
    INSERT INTO public.expenses (expense_date, month, year, factory_id, category_id, dpr_pr_type, dpr_pr_number, description, amount_lkr, exchange_rate_used, amount_usd, workflow_number, grn_number, remarks)
    VALUES ('2026-10-07', 10, 2026, f03, c_needle, 'PR', 'PR-2026-104', 'Needle Groz-Beckert DBx1 100pk', 74034.00, rate, ROUND(74034.00 / rate, 2), 'WF-9920', 'GRN-5550', 'Bulk pack for sewing section');

    -- Transaction 4: FTY 05 | Machine Spares | DPR | Juki DDL-9000 Looper & Parts
    INSERT INTO public.expenses (expense_date, month, year, factory_id, category_id, dpr_pr_type, dpr_pr_number, description, amount_lkr, exchange_rate_used, amount_usd, workflow_number, grn_number, remarks)
    VALUES ('2026-10-10', 10, 2026, f05, c_spares, 'DPR', 'DPR-2026-089', 'Juki DDL-9000 Looper & Parts', 250000.00, rate, ROUND(250000.00 / rate, 2), 'WF-9924', 'GRN-5562', 'Urgent maintenance spare parts');

    -- Transaction 5: FTY 05 | Jig Boards | DPR | Collar Jig Board Template
    INSERT INTO public.expenses (expense_date, month, year, factory_id, category_id, dpr_pr_type, dpr_pr_number, description, amount_lkr, exchange_rate_used, amount_usd, workflow_number, grn_number, remarks)
    VALUES ('2026-10-12', 10, 2026, f05, c_jig, 'DPR', 'DPR-2026-092', 'Collar Jig Board Template', 80000.00, rate, ROUND(80000.00 / rate, 2), 'WF-9930', 'GRN-5570', 'New order styling jigs');

    -- Transaction 6: FTY 05 | Hardware | PR | Pneumatic cylinder fittings
    INSERT INTO public.expenses (expense_date, month, year, factory_id, category_id, dpr_pr_type, dpr_pr_number, description, amount_lkr, exchange_rate_used, amount_usd, workflow_number, grn_number, remarks)
    VALUES ('2026-10-15', 10, 2026, f05, c_hardware, 'PR', 'PR-2026-110', 'Pneumatic cylinder fittings & valves', 40000.00, rate, ROUND(40000.00 / rate, 2), 'WF-9934', 'GRN-5575', 'Utility shop fittings');

    -- Transaction 7: FTY 05 | Folder | DPR | Hemming Folder Guide
    INSERT INTO public.expenses (expense_date, month, year, factory_id, category_id, dpr_pr_type, dpr_pr_number, description, amount_lkr, exchange_rate_used, amount_usd, workflow_number, grn_number, remarks)
    VALUES ('2026-10-18', 10, 2026, f05, c_folder, 'DPR', 'DPR-2026-095', 'Hemming Folder Guide 1/4 inch', 35000.00, rate, ROUND(35000.00 / rate, 2), 'WF-9941', 'GRN-5582', 'Line 2 bottom hem');

    -- Transaction 8: FTY 01 | Machine Spares | PR | Overlock Feed Dog & Knife
    INSERT INTO public.expenses (expense_date, month, year, factory_id, category_id, dpr_pr_type, dpr_pr_number, description, amount_lkr, exchange_rate_used, amount_usd, workflow_number, grn_number, remarks)
    VALUES ('2026-10-20', 10, 2026, f01, c_spares, 'PR', 'PR-2026-118', 'Overlock Feed Dog & Upper Knife Set', 58200.00, rate, ROUND(58200.00 / rate, 2), 'WF-9948', 'GRN-5590', 'Overlock preventive servicing');

    -- Transaction 9: FTY 04 | Hardware | DPR | Heavy duty casters & bearings
    INSERT INTO public.expenses (expense_date, month, year, factory_id, category_id, dpr_pr_type, dpr_pr_number, description, amount_lkr, exchange_rate_used, amount_usd, workflow_number, grn_number, remarks)
    VALUES ('2026-10-23', 10, 2026, f04, c_hardware, 'DPR', 'DPR-2026-102', 'Heavy duty casters & roller bearings', 26500.00, rate, ROUND(26500.00 / rate, 2), 'WF-9952', 'GRN-5595', 'Trolley overhaul');
END $$;
