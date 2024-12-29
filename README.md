# Aura AI - Creative Chatbot

Aura AI is a creative and knowledgeable AI assistant powered by GPT-4o-mini and the AI SDK. This project implements a chat interface where users can interact with Aura, save conversations, and manage their profile.

## Features

- Real-time chat with AI
- User authentication and profile management
- Conversation history for logged-in users
- Public sharing of conversations
- Voice input support
- Dark mode support

## Tech Stack

- Next.js 13 with App Router
- React
- TypeScript
- Tailwind CSS
- Supabase for authentication and database
- AI SDK for AI integration

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   \`\`\`
   git clone https://github.com/saikothasan/aura-ai.git
   cd aura-ai
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
   or
   \`\`\`
   yarn install
   \`\`\`

3. Set up environment variables:
   Create a \`.env.local\` file in the root directory and add the following variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   \`\`\`

4. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`
   or
   \`\`\`
   yarn dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

This project uses Supabase as the database. Here's the schema and setup information:

### Tables

1. \`profiles\` table:
   \`\`\`sql
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     username TEXT UNIQUE,
     avatar_url TEXT,
     website TEXT,
     updated_at TIMESTAMP WITH TIME ZONE
   );
   \`\`\`

2. \`conversations\` table:
   \`\`\`sql
   CREATE TABLE conversations (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     is_public BOOLEAN DEFAULT false
   );
   \`\`\`

3. \`messages\` table:
   \`\`\`sql
   CREATE TABLE messages (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     conversation_id UUID REFERENCES conversations NOT NULL,
     role TEXT NOT NULL,
     content TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   \`\`\`

### Row Level Security (RLS) Policies

Apply the following RLS policies to secure your data:

1. For the \`profiles\` table:
   \`\`\`sql
   CREATE POLICY "Users can view their own profile" 
     ON profiles FOR SELECT 
     USING (auth.uid() = id);

   CREATE POLICY "Users can update their own profile" 
     ON profiles FOR UPDATE 
     USING (auth.uid() = id);
   \`\`\`

2. For the \`conversations\` table:
   \`\`\`sql
   CREATE POLICY "Users can view their own conversations or public conversations" 
     ON conversations FOR SELECT 
     USING (auth.uid() = user_id OR is_public = true);

   CREATE POLICY "Users can update their own conversations" 
     ON conversations FOR UPDATE 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own conversations" 
     ON conversations FOR INSERT 
     WITH CHECK (auth.uid() = user_id);
   \`\`\`

3. For the \`messages\` table:
   \`\`\`sql
   CREATE POLICY "Users can view messages from their conversations or public conversations" 
     ON messages FOR SELECT 
     USING (
       auth.uid() = (SELECT user_id FROM conversations WHERE id = messages.conversation_id)
       OR 
       (SELECT is_public FROM conversations WHERE id = messages.conversation_id) = true
     );

   CREATE POLICY "Users can insert messages into their conversations" 
     ON messages FOR INSERT 
     WITH CHECK (
       auth.uid() = (SELECT user_id FROM conversations WHERE id = messages.conversation_id)
     );
   \`\`\`

### Triggers

Create a trigger to automatically create a profile when a new user signs up:

\`\`\`sql
CREATE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
\`\`\`

After setting up these tables, policies, and triggers in your Supabase project, your database will be ready to use with the Aura AI application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

