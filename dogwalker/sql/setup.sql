-- Setup for Walkie Module (DogWalker)

-- Dogs Table
CREATE TABLE IF NOT EXISTS walkie_dogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    breed TEXT,
    owner TEXT NOT NULL,
    phone TEXT,
    image TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Walks Table
CREATE TABLE IF NOT EXISTS walkie_walks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id UUID REFERENCES walkie_dogs(id) ON DELETE CASCADE,
    walk_date DATE DEFAULT CURRENT_DATE,
    walk_time TIME,
    duration TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports Table
CREATE TABLE IF NOT EXISTS walkie_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    walk_id UUID REFERENCES walkie_walks(id) ON DELETE CASCADE,
    peed BOOLEAN DEFAULT FALSE,
    pooped BOOLEAN DEFAULT FALSE,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Assuming public for simplicity as per pensionet pattern, but recommend adding auth)
ALTER TABLE walkie_dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkie_walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkie_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON walkie_dogs FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON walkie_dogs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON walkie_dogs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON walkie_dogs FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON walkie_walks FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON walkie_walks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON walkie_walks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON walkie_walks FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON walkie_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON walkie_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON walkie_reports FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON walkie_reports FOR DELETE USING (true);

-- Settings Table
CREATE TABLE IF NOT EXISTS walkie_settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE walkie_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON walkie_settings FOR SELECT USING (true);
CREATE POLICY "Allow public upsert" ON walkie_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON walkie_settings FOR UPDATE USING (true);

