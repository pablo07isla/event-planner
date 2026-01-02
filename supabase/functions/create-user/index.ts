import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the session from the request headers to check if caller is admin
    // Note: We can also check this via RLS if we insert into a table,
    // but here we are calling an admin API.
    // Ideally, we should verify the JWT of the caller.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header passed");
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if the user is an admin in the public.users table
    const { data: userData, error: accessError } = await supabaseClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (accessError || userData?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: Only admins can create users" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { email, password, username, role } = await req.json();

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Create the user using the Admin API
    const { data: newUser, error: createError } =
      await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          username: username,
        },
      });

    if (createError) throw createError;

    // The trigger will create the public.users entry, but if we want to set a specific role
    // (other than 'user' which is the default in the trigger), we might need to update it.
    // However, the trigger copies username. Let's wait a bit or update it if role is provided.

    if (role && role !== "user" && newUser.user) {
      // Update the role in public.users
      const { error: updateError } = await supabaseClient
        .from("users")
        .update({ role: role })
        .eq("id", newUser.user.id);

      if (updateError) {
        console.error("Failed to update role", updateError);
        // We don't fail the whole request, but we log it.
      }
    }

    return new Response(JSON.stringify(newUser), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
